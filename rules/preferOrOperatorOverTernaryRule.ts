import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { nodeIsKind } from '../helpers/nodeIsKind';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithFunction(sourceFile, walk);
	}
}

function walk(ctx: Lint.WalkContext<void>) {
	ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
		if (nodeIsKind<ts.ConditionalExpression>(node, 'ConditionalExpression')) {
			check(ctx, node);
		}
		return ts.forEachChild(node, cb);
	});
}

function check(ctx: Lint.WalkContext<void>, node: ts.ConditionalExpression) {
	const sf = ctx.sourceFile;
	const { condition, whenTrue, questionToken, colonToken } = node;

	if (
		condition.kind === ts.SyntaxKind.Identifier &&
		whenTrue.kind === ts.SyntaxKind.Identifier &&
		condition.getText(sf) === whenTrue.getText(sf)
	) {
		const fix = Lint.Replacement.replaceFromTo(
			questionToken.getStart(sf),
			colonToken.getStart(sf) + 1,
			'||'
		);
		ctx.addFailureAtNode(
			whenTrue,
			`use '||' when first and second operands of ternary are identical`,
			fix
		);
	}
}
