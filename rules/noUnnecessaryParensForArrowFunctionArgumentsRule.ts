import * as Lint from 'tslint/lib'
import * as ts from 'typescript'
import { nodeIsKind } from '../helpers/nodeIsKind'

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithFunction(sourceFile, walk)
	}
}

function walk(ctx: Lint.WalkContext<void>) {
	ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
		if (
			nodeIsKind<ts.ArrowFunction>(node, 'ArrowFunction') &&
			node.parameters.length === 1
		) {
			check(ctx, node)
		}
		return ts.forEachChild(node, cb)
	})
}

function check(ctx: Lint.WalkContext<void>, node: ts.ArrowFunction) {
	const param = node.parameters[0]
	const hasParens = node.getText(ctx.sourceFile).indexOf('(') === 0
	const hasType = !!param.type
	const isRest = !!param.dotDotDotToken
	const hasDefaultValue = !!param.initializer
	const isDestructured =
		param.name.kind === ts.SyntaxKind.ObjectBindingPattern ||
		param.name.kind === ts.SyntaxKind.ArrayBindingPattern

	if (hasParens && !(hasType || isDestructured || isRest || hasDefaultValue)) {
		ctx.addFailureAtNode(
			param,
			'arrow functions with one argument should not have parentheses around the argument'
		)
	}
}
