import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import getClassMethods from '../helpers/getClassMethods';
import nodeIsKind from '../helpers/nodeIsKind';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new DeclareClassMethodsAfterUseWalker(sourceFile, this.getOptions()));
	}
}

class DeclareClassMethodsAfterUseWalker extends Lint.RuleWalker {
	private currentMethodName: string;
	private visitedMethodDeclarations: string[];
	private visitedMethodCalls: string[];

	public visitClassDeclaration(node: ts.ClassDeclaration) {
		this.validate(node);
		super.visitClassDeclaration(node);
	}

	public visitClassExpression(node: ts.ClassExpression) {
		this.validate(node);
		super.visitClassExpression(node);
	}

	private validate(node: ts.ClassLikeDeclaration) {
		this.visitedMethodDeclarations = [];
		this.visitedMethodCalls = [];

		for (const method of getClassMethods(node)) {
			this.currentMethodName = method.name.getText(this.getSourceFile());
			this.visitedMethodDeclarations.push(this.currentMethodName);
			ts.forEachChild(method, child => {
				this.visitChildren(child);
			});
		}
	}

	private visitChildren(node: ts.Node) {
		ts.forEachChild(node, child => {
			if (nodeIsKind<ts.CallExpression>(child, k => k.CallExpression)) {
				this.visitCallExpressionInMethod(child);
			}

			this.visitChildren(child);
		});
	}

	private visitCallExpressionInMethod(node: ts.CallExpression) {
		if (!this.callExpressionBelongsToThis(node.expression)) { return; }

		const propertyExpression = node.expression as ts.PropertyAccessExpression;
		const methodName = propertyExpression.name.text;

		if (this.methodHasBeenDeclared(methodName)) {
			if (!this.isRecursion(methodName) && !this.methodHasBeenCalled(methodName)) {
				this.addFailure(
					this.createFailure(
						propertyExpression.getStart(this.getSourceFile()),
						propertyExpression.getWidth(this.getSourceFile()),
						'declare class methods after use'
					)
				);
			}
		} else {
			// declaration needs to come after first use, not all uses.
			// once we've seen a callsite before a declaration, don't
			// error on any future callsites for that method
			this.visitedMethodCalls.push(methodName);
		}
	}

	private callExpressionBelongsToThis(node: ts.Expression) {
		return (
			nodeIsKind<ts.PropertyAccessExpression>(node, k => k.PropertyAccessExpression) &&
			nodeIsKind(node.expression, k => k.ThisKeyword)
		);
	}

	private methodHasBeenDeclared(name: string) {
		return this.visitedMethodDeclarations.indexOf(name) > -1;
	}

	private methodHasBeenCalled(name: string) {
		return this.visitedMethodCalls.indexOf(name) > -1;
	}

	private isRecursion(name: string) {
		return this.currentMethodName === name;
	}
}
