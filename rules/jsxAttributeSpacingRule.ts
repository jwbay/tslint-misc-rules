import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new JsxAttributeSpacingWalker(sourceFile, this.getOptions()));
	}
}

class JsxAttributeSpacingWalker extends Lint.RuleWalker {
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
			const [identifier, assignment, initializer] = attribute.getChildren();
			if (!initializer) {
				continue;
			}

			if (
				assignment.getStart() !== assignment.getFullStart() ||
				initializer.getStart() !== initializer.getFullStart()
			) {
				this.addFailure(
					this.createFailure(
						attribute.getStart(),
						attribute.getWidth(),
						`jsx attribute '${identifier.getText()}' should not have whitespace around '='`
					)
				);
			}
		}
	}
}