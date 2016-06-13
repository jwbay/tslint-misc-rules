import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new PreferOrOperatorOverTernaryWalker(sourceFile, this.getOptions()));
	}
}

class PreferOrOperatorOverTernaryWalker extends Lint.RuleWalker {
	public visitConditionalExpression(node: ts.ConditionalExpression) {
		const { condition, whenTrue } = node;

		if (
			condition.kind === ts.SyntaxKind.Identifier &&
			whenTrue.kind === ts.SyntaxKind.Identifier &&
			condition.getText() === whenTrue.getText()
		) {
			this.addFailure(
				this.createFailure(
					whenTrue.getStart(),
					whenTrue.getWidth(),
					`use '||' when first and second operands of ternary are identical`
				)
			);
		}

		super.visitConditionalExpression(node);
	}
}