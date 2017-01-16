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
			const sf = this.getSourceFile();
			const failureStart = body.getStart(sf);
			const fix = new Lint.Fix('no-braces-for-single-line-arrow-functions', [
				this.createReplacement(failureStart, body.getWidth(sf), this.getFixedText(body))
			]);
			this.addFailure(
				this.createFailure(
					failureStart,
					body.getWidth(sf),
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

	private getFixedText(node: ts.Block) {
		const body = node.getChildAt(1);
		const statement = body.getChildAt(0);
		let result = this.stripSemicolon(body.getText(this.getSourceFile()));
		if (statement && statement.kind === ts.SyntaxKind.ReturnStatement) {
			result = result.replace('return', '').trim();

			const returnExpression = statement.getChildAt(1);
			if (returnExpression && returnExpression.kind === ts.SyntaxKind.ObjectLiteralExpression) {
				result = `(${result})`;
			}
		}

		return result;
	}

	private stripSemicolon(text: string) {
		let result = text.trim();
		if (result.match(/;$/)) {
			result = result.slice(0, text.length - 1);
		}
		return result;
	}
}
