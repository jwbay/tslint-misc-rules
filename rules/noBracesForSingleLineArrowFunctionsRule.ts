import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new NoBracesForSingleLineArrowFunctionsWalker(sourceFile, this.getOptions()));
	}
}

class NoBracesForSingleLineArrowFunctionsWalker extends Lint.RuleWalker {
	protected visitArrowFunction(node: ts.ArrowFunction) {
		super.visitArrowFunction(node);
		const { body } = node;

		if (this.functionBodyIsBraced(body) && this.functionBodyIsOneLine(body)) {
			this.addFailure(
				this.createFailure(
					body.getStart(this.getSourceFile()),
					1,
					'single-line arrow functions should not be wrapped in braces'
				)
			);
		}
	}

	private functionBodyIsBraced(node: ts.ConciseBody): node is ts.Block {
		return node && node.kind === ts.SyntaxKind.Block;
	}

	private functionBodyIsOneLine(node: ts.Block) {
		const bodyText = node.getFullText(this.getSourceFile());
		return !bodyText.match(/\n/);
	}
}