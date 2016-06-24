import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import getClassMethods from '../helpers/getClassMethods';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new DeclareClassMethodsAfterUseWalker(sourceFile, this.getOptions()));
	}
}

class DeclareClassMethodsAfterUseWalker extends Lint.RuleWalker {
	private currentMethodName: string;
	private visitedMethodNames: string[];

	public visitClassDeclaration(node: ts.ClassDeclaration) {
		this.validate(node);
		super.visitClassDeclaration(node);
	}

	public visitClassExpression(node: ts.ClassExpression) {
		this.validate(node);
		super.visitClassExpression(node);
	}

	private validate(node: ts.ClassLikeDeclaration) {
		this.visitedMethodNames = [];

		for (const method of getClassMethods(node)) {
			this.currentMethodName = method.name.getText(this.getSourceFile());
			this.visitedMethodNames.push(this.currentMethodName);
			ts.forEachChild(method, child => {
				this.visitChildren(child);
			});
		}
	}

	private visitChildren(node: ts.Node) {
		ts.forEachChild(node, child => {
			if (this.isCallExpression(child)) {
				this.visitCallExpressionInMethod(child);
			}

			this.visitChildren(child);
		});
	}

	private isCallExpression(node: ts.Node): node is ts.CallExpression {
		return node.kind === ts.SyntaxKind.CallExpression;
	}

	private visitCallExpressionInMethod(node: ts.CallExpression) {
		if (!this.callExpressionBelongsToThis(node.expression)) { return; }

		const propertyExpression = node.expression as ts.PropertyAccessExpression;
		const methodName = propertyExpression.name.text;

		if (this.haveVisitedMethod(methodName) && !this.isRecursion(methodName)) {
			this.addFailure(
				this.createFailure(
					propertyExpression.getStart(this.getSourceFile()),
					propertyExpression.getWidth(this.getSourceFile()),
					'declare class methods after use'
				)
			);
		}
	}

	private callExpressionBelongsToThis(node: ts.Expression) {
		return (
			node &&
			node.kind === ts.SyntaxKind.PropertyAccessExpression &&
			(node as ts.PropertyAccessExpression).expression.kind === ts.SyntaxKind.ThisKeyword
		);
	}

	private haveVisitedMethod(name: string) {
		return this.visitedMethodNames.indexOf(name) > -1;
	}

	private isRecursion(name: string) {
		return this.currentMethodName === name;
	}
}