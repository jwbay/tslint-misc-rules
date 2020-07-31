import * as Lint from 'tslint/lib'
import * as ts from 'typescript'
import { getJsxAttributes } from '../helpers/getJsxAttributes'
import { nodeIsKind } from '../helpers/nodeIsKind'

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithFunction(sourceFile, walk)
	}
}

function walk(ctx: Lint.WalkContext<void>) {
	ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
		if (nodeIsKind<ts.JsxElement>(node, 'JsxElement')) {
			checkAttributes(ctx, getJsxAttributes(node.openingElement))
		} else if (nodeIsKind<ts.JsxSelfClosingElement>(node, 'JsxSelfClosingElement')) {
			checkAttributes(ctx, getJsxAttributes(node))
		}
		return ts.forEachChild(node, cb)
	})
}

function checkAttributes(
	ctx: Lint.WalkContext<void>,
	nodes: ts.NodeArray<ts.JsxAttribute>
) {
	const sf = ctx.sourceFile
	const nonSpreadAttributes = nodes.filter((n) => n.kind === ts.SyntaxKind.JsxAttribute)

	for (const attribute of nonSpreadAttributes) {
		const [identifier, assignment, initializer] = attribute.getChildren(sf)
		if (!initializer) {
			continue
		}

		if (
			assignment.getStart(sf) !== assignment.getFullStart() ||
			initializer.getStart(sf) !== initializer.getFullStart()
		) {
			const fix = [
				Lint.Replacement.deleteText(
					assignment.getFullStart(),
					assignment.getStart(sf) - assignment.getFullStart()
				),
				Lint.Replacement.deleteText(
					initializer.getFullStart(),
					initializer.getStart(sf) - initializer.getFullStart()
				),
			]
			ctx.addFailureAtNode(
				attribute,
				`jsx attribute '${identifier.getText(
					sf
				)}' should not have whitespace around '='`,
				fix
			)
		}
	}
}
