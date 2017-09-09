import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { getClassMethods } from '../helpers/getClassMethods';
import { nodeIsKind } from '../helpers/nodeIsKind';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new DeclareClassMethodsAfterUseWalker(sourceFile, this.ruleName, this.getOptions()));
	}
}

class DeclareClassMethodsAfterUseWalker extends Lint.AbstractWalker<{}> {
	private currentMethodName: string;
	private visitedMethodDeclarations: string[];
	private visitedMethodCalls: string[];

	public walk(sourceFile: ts.SourceFile) {
		const cb = (node: ts.Node): void => {
			if (
				nodeIsKind(node, 'ClassDeclaration') ||
				nodeIsKind(node, 'ClassExpression')
			) {
				this.validate(node as ts.ClassLikeDeclaration);
			}
			return ts.forEachChild(node, cb);
		};

		ts.forEachChild(sourceFile, cb);
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
			if (nodeIsKind<ts.CallExpression>(child, 'CallExpression')) {
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
				this.addFailureAtNode(propertyExpression, 'declare class methods after use');
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
			nodeIsKind<ts.PropertyAccessExpression>(node, 'PropertyAccessExpression') &&
			nodeIsKind(node.expression, 'ThisKeyword')
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
