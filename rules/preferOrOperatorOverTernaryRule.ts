import * as Lint from 'tslint/lib';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new PreferOrOperatorOverTernaryWalker(sourceFile, this.getOptions()));
	}
}

class PreferOrOperatorOverTernaryWalker extends Lint.RuleWalker {
	public visitConditionalExpression(node: ts.ConditionalExpression) {
		const { condition, whenTrue, questionToken, colonToken } = node;

		if (
			condition.kind === ts.SyntaxKind.Identifier &&
			whenTrue.kind === ts.SyntaxKind.Identifier &&
			condition.getText() === whenTrue.getText()
		) {
			const start = questionToken.getStart();
			const width = colonToken.getStart() + 1 - start;
			const fix = new Lint.Fix('prefer-or-operator-over-ternary', [
				this.createReplacement(start, width, '||')
			]);
			this.addFailure(
				this.createFailure(
					whenTrue.getStart(),
					whenTrue.getWidth(),
					`use '||' when first and second operands of ternary are identical`,
					fix
				)
			);
		}

		super.visitConditionalExpression(node);
	}
}
