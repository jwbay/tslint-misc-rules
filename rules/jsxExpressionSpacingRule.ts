import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { nodeIsKind } from '../helpers/nodeIsKind';

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
		const [openingBrace, value, closingBrace] = node.getChildren(sf);

		if (!value || !nodeIsKind(closingBrace, k => k.CloseBraceToken)) {
			return;
		}

		if (!this.isPrecededByValidWhitespace(closingBrace)) {
			const braceStart = closingBrace.getStart(sf);
			const expressionEnd = value.getEnd();
			const spaceCount = braceStart - expressionEnd;
			this.addFailureAtNode(
				closingBrace,
				`jsx expression should have one space before closing '}'`,
				spaceCount === 0
					? this.appendText(expressionEnd, ' ')
					: this.deleteText(expressionEnd, spaceCount - 1)
			);
		}

		if (!this.isPrecededByValidWhitespace(value)) {
			const braceEnd = openingBrace.getEnd();
			const expressionStart = value.getStart(sf);
			const spaceCount = expressionStart - braceEnd;
			this.addFailureAtNode(
				openingBrace,
				`jsx expression should have one space after opening '{'`,
				spaceCount === 0
					? this.appendText(braceEnd, ' ')
					: this.deleteText(braceEnd, spaceCount - 1)
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
