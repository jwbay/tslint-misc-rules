import * as Lint from 'tslint/lib'
import * as ts from 'typescript'
import { nodeIsKind } from '../helpers/nodeIsKind'
import { getJsxAttributes } from '../helpers/getJsxAttributes'

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
	const nonSpreadAttributes = nodes.filter(n => n.kind === ts.SyntaxKind.JsxAttribute)

	for (const attribute of nonSpreadAttributes) {
		const { initializer, name } = attribute
		if (!initializer) {
			continue
		}

		const value = initializer.getChildAt(1, sf)
		const closeBrace = initializer.getChildAt(2, sf)

		if (
			nodeIsKind(value, 'StringLiteral') &&
			nodeIsKind(closeBrace, 'CloseBraceToken')
		) {
			const fix = Lint.Replacement.replaceFromTo(
				initializer.getStart(sf),
				closeBrace.getStart(sf) + 1,
				value.getText(sf)
			)
			const attributeName = name.getText(sf)
			const propValue = value.getText(sf)
			ctx.addFailureAtNode(
				attribute,
				`jsx attribute '${attributeName}' should not have braces around string prop ${propValue}`,
				fix
			)
		}
	}
}
