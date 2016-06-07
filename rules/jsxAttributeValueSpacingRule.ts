import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new JsxAttributeValueSpacingWalker(sourceFile, this.getOptions()));
	}
}

class JsxAttributeValueSpacingWalker extends Lint.RuleWalker {
	public visitJsxElement(node: ts.JsxElement) {
		this.validateAttributes(node.openingElement.attributes as ts.NodeArray<ts.JsxAttribute>);
		super.visitJsxElement(node);
	}

	public visitJsxSelfClosingElement(node: ts.JsxSelfClosingElement) {
		this.validateAttributes(node.attributes as ts.NodeArray<ts.JsxAttribute>);
		super.visitJsxSelfClosingElement(node);
	}

	private validateAttributes(nodes: ts.JsxAttribute[]) {
		const nonSpreadAttributes = nodes.filter(n => n.kind === ts.SyntaxKind.JsxAttribute);

		for (const attribute of nonSpreadAttributes) {
			const { initializer, name } = attribute;
			if (!initializer) {
				continue;
			}

			const value = initializer.getChildAt(1);
			const closingBrace = initializer.getChildAt(2);

			if (!value || !this.isClosingBrace(closingBrace)) {
				continue;
			}

			if (
				!this.isPrecededByValidWhitespace(value) ||
				!this.isPrecededByValidWhitespace(closingBrace)
			) {
				this.addFailure(
					this.createFailure(
						attribute.getStart(),
						attribute.getWidth(),
						`jsx attribute '${name.getText()}' should have one space between braces and value`
					)
				);
			}
		}
	}

	private isPrecededByValidWhitespace(node: ts.Node) {
		return (
			node.getFullStart() === node.getStart() - 1 ||
			node.getFullText().match(/^[\r\n]+/)
		);
	}

	private isClosingBrace(node: ts.Node) {
		return node && node.kind === ts.SyntaxKind.CloseBraceToken;
	}
}