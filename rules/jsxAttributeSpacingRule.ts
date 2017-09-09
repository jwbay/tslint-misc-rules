import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import getJsxAttributes from '../helpers/getJsxAttributes';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new JsxAttributeSpacingWalker(sourceFile, this.getOptions()));
	}
}

class JsxAttributeSpacingWalker extends Lint.RuleWalker {
	public visitJsxElement(node: ts.JsxElement) {
		this.validateAttributes(getJsxAttributes(node.openingElement));
		super.visitJsxElement(node);
	}

	public visitJsxSelfClosingElement(node: ts.JsxSelfClosingElement) {
		this.validateAttributes(getJsxAttributes(node));
		super.visitJsxSelfClosingElement(node);
	}

	private validateAttributes(nodes: ts.NodeArray<ts.JsxAttribute>) {
		const sf = this.getSourceFile();
		const nonSpreadAttributes = nodes.filter(n => n.kind === ts.SyntaxKind.JsxAttribute);

		for (const attribute of nonSpreadAttributes) {
			const [identifier, assignment, initializer] = attribute.getChildren(sf);
			if (!initializer) {
				continue;
			}

			if (
				assignment.getStart(sf) !== assignment.getFullStart() ||
				initializer.getStart(sf) !== initializer.getFullStart()
			) {
				const start = attribute.getStart(sf);
				const width = attribute.getWidth(sf);
				const fix = [
					this.deleteText(assignment.getFullStart(), assignment.getStart(sf) - assignment.getFullStart()),
					this.deleteText(initializer.getFullStart(), initializer.getStart(sf) - initializer.getFullStart())
				];
				this.addFailure(
					this.createFailure(
						start,
						width,
						`jsx attribute '${identifier.getText(sf)}' should not have whitespace around '='`,
						fix
					)
				);
			}
		}
	}
}
