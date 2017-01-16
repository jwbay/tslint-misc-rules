import * as Lint from 'tslint/lib';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new PreferOrOperatorOverTernaryWalker(sourceFile, this.getOptions()));
	}
}

class PreferOrOperatorOverTernaryWalker extends Lint.RuleWalker {
	public visitConditionalExpression(node: ts.ConditionalExpression) {
		const sf = this.getSourceFile();
		const { condition, whenTrue, questionToken, colonToken } = node;

		if (
			condition.kind === ts.SyntaxKind.Identifier &&
			whenTrue.kind === ts.SyntaxKind.Identifier &&
			condition.getText(sf) === whenTrue.getText(sf)
		) {
			const start = questionToken.getStart(sf);
			const width = colonToken.getStart(sf) + 1 - start;
			const fix = new Lint.Fix('prefer-or-operator-over-ternary', [
				this.createReplacement(start, width, '||')
			]);
			this.addFailure(
				this.createFailure(
					whenTrue.getStart(sf),
					whenTrue.getWidth(sf),
					`use '||' when first and second operands of ternary are identical`,
					fix
				)
			);
		}

		super.visitConditionalExpression(node);
	}
}
