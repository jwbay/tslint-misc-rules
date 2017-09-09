import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { getLeadingWhitespace } from '../helpers/getLeadingWhitespace';
import { nodeIsKind } from '../helpers/nodeIsKind';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithFunction(sourceFile, walk);
	}
}

function walk(ctx: Lint.WalkContext<void>) {
	ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
		if (nodeIsKind<ts.JsxElement>(node, 'JsxElement')) {
			check(ctx, node.openingElement);
		} else if (nodeIsKind<ts.JsxSelfClosingElement>(node, 'JsxSelfClosingElement')) {
			check(ctx, node);
		}
		return ts.forEachChild(node, cb);
	});
}

function check(ctx: Lint.WalkContext<void>, node: ts.JsxOpeningLikeElement) {
	for (const token of findClosingTokens(node)) {
		if (getLeadingWhitespace(token).match(/\n/g)) {
			const fix = Lint.Replacement.deleteText(
				token.getFullStart(),
				token.getStart(ctx.sourceFile) - token.getFullStart()
			);
			ctx.addFailureAtNode(
				token,
				'closing brackets for jsx elements should not be on newlines',
				fix
			);
		}
	}
}

function findClosingTokens(node: ts.JsxOpeningLikeElement) {
	return node.getChildren().filter(child =>
		child.kind === ts.SyntaxKind.SlashToken ||
		child.kind === ts.SyntaxKind.GreaterThanToken
	);
}
