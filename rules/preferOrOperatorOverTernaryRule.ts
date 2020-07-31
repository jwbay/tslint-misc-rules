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
		if (nodeIsKind<ts.ConditionalExpression>(node, 'ConditionalExpression')) {
			check(ctx, node)
		}
		return ts.forEachChild(node, cb)
	})
}

function check(ctx: Lint.WalkContext<void>, node: ts.ConditionalExpression) {
	const sf = ctx.sourceFile
	const { condition, whenTrue, questionToken, colonToken } = node

	if (
		condition.getText(sf) === whenTrue.getText(sf) &&
		((isIdentifier(condition) && isIdentifier(whenTrue)) ||
			(isPropertyAccessChain(condition) && isPropertyAccessChain(whenTrue)))
	) {
		const fix = Lint.Replacement.replaceFromTo(
			questionToken.getStart(sf),
			colonToken.getStart(sf) + 1,
			'||'
		)
		ctx.addFailureAtNode(
			whenTrue,
			`use '||' when first and second operands of ternary are identical`,
			fix
		)
	}
}

function isPropertyAccessChain(startNode: ts.Expression) {
	if (!isPropertyAccess(startNode) || !isIdentifier(startNode.name)) {
		return false
	}

	let node = startNode
	while (isPropertyAccess(node.expression)) {
		node = node.expression
	}

	return (
		node.expression &&
		(isIdentifier(node.expression) ||
			node.expression.kind === ts.SyntaxKind.ThisKeyword)
	)
}

function isIdentifier(node: ts.Node): node is ts.Identifier {
	return node && node.kind === ts.SyntaxKind.Identifier
}

function isPropertyAccess(node: ts.Node): node is ts.PropertyAccessExpression {
	return node && node.kind === ts.SyntaxKind.PropertyAccessExpression
}
