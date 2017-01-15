import * as Lint from 'tslint/lib';
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

		if (
			this.functionBodyIsBraced(body) &&
			this.functionBodyHasOneStatement(body) &&
			this.functionBodyIsOneLine(body)
		) {
			const failureStart = body.getStart(this.getSourceFile());
			const text = body.getChildAt(1).getText().replace('return', '').replace(';', '').trim();
			const fix = new Lint.Fix('no-braces-for-single-line-arrow-functions', [
				this.createReplacement(failureStart, body.getWidth(), text)
			]);
			this.addFailure(
				this.createFailure(
					failureStart,
					body.getWidth(),
					'single-line arrow functions should not be wrapped in braces',
					fix
				)
			);
		}
	}

	private functionBodyIsBraced(node: ts.ConciseBody): node is ts.Block {
		return node && node.kind === ts.SyntaxKind.Block;
	}

	private functionBodyHasOneStatement(node: ts.Block) {
		return node.statements.length === 1;
	}

	private functionBodyIsOneLine(node: ts.Block) {
		const bodyText = node.getFullText(this.getSourceFile());
		return !bodyText.match(/\n/);
	}
}
