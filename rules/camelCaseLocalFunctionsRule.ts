import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { nodeIsKind } from '../helpers/nodeIsKind';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new CamelCaseFunctionsWalker(sourceFile, this.getOptions()));
	}
}

class CamelCaseFunctionsWalker extends Lint.RuleWalker {
	public visitCallExpression(node: ts.CallExpression) {
		const name = node.expression;
		if (nodeIsKind<ts.Identifier>(name, k => k.Identifier)) {
			const firstLetter = name.text.charAt(0);
			if (firstLetter !== firstLetter.toLowerCase() && !this.isInWhitelist(name.text)) {
				this.addFailure(
					this.createFailure(
						name.getStart(this.getSourceFile()),
						name.getWidth(this.getSourceFile()),
						'local function names should be camelCase'
					)
				);
			}
		}

		super.visitCallExpression(node);
	}

	private isInWhitelist(name: string) {
		return [
			'Array',
			'Boolean',
			'Error',
			'Function',
			'Number',
			'Object',
			'String'
		].indexOf(name) > -1;
	}
}
