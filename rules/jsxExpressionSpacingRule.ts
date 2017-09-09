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
		if (nodeIsKind<ts.JsxExpression>(node, 'JsxExpression')) {
			checkExpression(ctx, node);
		}
		return ts.forEachChild(node, cb);
	});
}

function checkExpression(ctx: Lint.WalkContext<void>, node: ts.JsxExpression) {
	const sf = ctx.sourceFile;
	const [openingBrace, value, closingBrace] = node.getChildren(sf);

	if (!value || !nodeIsKind(closingBrace, 'CloseBraceToken')) {
		return;
	}

	if (!isPrecededByValidWhitespace(closingBrace, sf)) {
		const braceStart = closingBrace.getStart(sf);
		const expressionEnd = value.getEnd();
		const spaceCount = braceStart - expressionEnd;
		ctx.addFailureAtNode(
			closingBrace,
			`jsx expression should have one space before closing '}'`,
			spaceCount === 0
				? Lint.Replacement.appendText(expressionEnd, ' ')
				: Lint.Replacement.deleteText(expressionEnd, spaceCount - 1)
		);
	}

	if (!isPrecededByValidWhitespace(value, sf)) {
		const braceEnd = openingBrace.getEnd();
		const expressionStart = value.getStart(sf);
		const spaceCount = expressionStart - braceEnd;
		ctx.addFailureAtNode(
			openingBrace,
			`jsx expression should have one space after opening '{'`,
			spaceCount === 0
				? Lint.Replacement.appendText(braceEnd, ' ')
				: Lint.Replacement.deleteText(braceEnd, spaceCount - 1)
		);
	}
}

function isPrecededByValidWhitespace(node: ts.Node, sf: ts.SourceFile) {
	return (
		node.getFullStart() === node.getStart(sf) - 1 ||
		/^[\r\n]+/.test(node.getFullText(sf))
	);
}
