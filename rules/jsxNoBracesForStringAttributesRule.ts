import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import nodeIsKind from '../helpers/nodeIsKind';

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
		const sf = this.getSourceFile();
		const nonSpreadAttributes = nodes.filter(n => n.kind === ts.SyntaxKind.JsxAttribute);

		for (const attribute of nonSpreadAttributes) {
			const { initializer, name } = attribute;
			if (!initializer) {
				continue;
			}

			const value = initializer.getChildAt(1, sf);
			const closeBrace = initializer.getChildAt(2, sf);

			if (
				nodeIsKind(value, k => k.StringLiteral) &&
				nodeIsKind(closeBrace, k => k.CloseBraceToken)
			) {
				const fix = new Lint.Fix('jsx-no-braces-for-string-attributes', [
					this.createReplacement(
						initializer.getStart(sf),
						closeBrace.getStart(sf) + 1 - initializer.getStart(sf),
						value.getText(sf)
					)
				]);
				this.addFailure(
					this.createFailure(
						attribute.getStart(sf),
						attribute.getWidth(sf),
						`jsx attribute '${name.getText(sf)}' should not have braces around string prop ${value.getText(sf)}`,
						fix
					)
				);
			}
		}
	}
}
