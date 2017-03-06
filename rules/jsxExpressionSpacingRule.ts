import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import nodeIsKind from '../helpers/nodeIsKind';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new JsxExpressionSpacingWalker(sourceFile, this.getOptions()));
	}
}

class JsxExpressionSpacingWalker extends Lint.RuleWalker {
	public walkChildren(node: ts.Node) {
		if (node.kind === ts.SyntaxKind.JsxExpression) {
			this.validateNode(node as ts.JsxExpression);
		}
		super.walkChildren(node);
	}

	private validateNode(node: ts.JsxExpression) {
		const sf = this.getSourceFile();
		const [ , value, closingBrace ] = node.getChildren(sf);

		if (!value || !nodeIsKind(closingBrace, k => k.CloseBraceToken)) {
			return;
		}

		if (!this.isPrecededByValidWhitespace(closingBrace)) {
			this.addFailure(
				this.createFailure(
					closingBrace.getStart(sf),
					1,
					'jsx expression should have one space before closing \'}\'',
					new Lint.Fix('jsx-expression-spacing', [
						this.createReplacement(value.getEnd(), closingBrace.getStart(sf) - value.getEnd(), ' ')
					])
				)
			);
		}

		if (!this.isPrecededByValidWhitespace(value)) {
			this.addFailure(
				this.createFailure(
					node.getStart(sf) + 1,
					1,
					'jsx expression should have one space after opening \'{\'',
					new Lint.Fix('jsx-expression-spacing', [
						this.createReplacement(node.getStart(sf) + 1, value.getFullWidth(), ' ' + value.getText(sf))
					])
				)
			);
		}
	}

	private isPrecededByValidWhitespace(node: ts.Node) {
		return (
			node.getFullStart() === node.getStart(this.getSourceFile()) - 1 ||
			node.getFullText().match(/^[\r\n]+/)
		);
	}
}
