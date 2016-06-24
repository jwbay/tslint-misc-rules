import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new CamelCaseFunctionsWalker(sourceFile, this.getOptions()));
	}
}

class CamelCaseFunctionsWalker extends Lint.RuleWalker {
	public visitCallExpression(node: ts.CallExpression) {
		const name = node.expression;
		if (this.isIdentifier(name)) {
			const firstLetter = name.text.charAt(0);
			if (firstLetter !== firstLetter.toLowerCase()) {
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

	private isIdentifier(node: ts.Node): node is ts.Identifier {
		return node.kind === ts.SyntaxKind.Identifier;
	}
}
