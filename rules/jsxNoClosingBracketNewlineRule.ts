import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import getLeadingWhitespace from '../helpers/getLeadingWhitespace';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new JsxNoClosingBracketNewlineWalker(sourceFile, this.getOptions()));
	}
}

class JsxNoClosingBracketNewlineWalker extends Lint.RuleWalker {
	public visitJsxElement(node: ts.JsxElement) {
		this.validate(node.openingElement);
		super.visitJsxElement(node);
	}

	public visitJsxSelfClosingElement(node: ts.JsxSelfClosingElement) {
		this.validate(node);
		super.visitJsxSelfClosingElement(node);
	}

	private validate(node: ts.JsxOpeningLikeElement) {
		for (const token of this.findClosingTokens(node)) {
			if (getLeadingWhitespace(token).match(/\n/g)) {
				this.addFailure(
					this.createFailure(
						token.getStart(),
						token.getWidth(),
						'closing brackets for jsx elements should not be on newlines'
					)
				);
			}
		}
	}

	private findClosingTokens(node: ts.JsxOpeningLikeElement) {
		return node.getChildren().filter(child =>
			child.kind === ts.SyntaxKind.SlashToken ||
			child.kind === ts.SyntaxKind.GreaterThanToken
		);
	}
}
