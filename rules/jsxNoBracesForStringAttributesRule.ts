import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new JsxNoBracesForStringAttributesWalker(sourceFile, this.getOptions()));
	}
}

class JsxNoBracesForStringAttributesWalker extends Lint.RuleWalker {
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
				return;
			}

			const value = initializer.getChildAt(1);
			const closeBrace = initializer.getChildAt(2);

			if (this.isStringLiteral(value) && this.isClosingBrace(closeBrace)) {
				this.addFailure(
					this.createFailure(
						attribute.getStart(),
						attribute.getWidth(),
						`jsx attribute '${name.getText()}' should not have braces around string prop ${value.getText()}`
					)
				);
			}
		}
	}

	private isStringLiteral(node: ts.Node): node is ts.StringLiteral {
		return node && node.kind === ts.SyntaxKind.StringLiteral;
	}

	private isClosingBrace(node: ts.Node) {
		return node && node.kind === ts.SyntaxKind.CloseBraceToken;
	}
}