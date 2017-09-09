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
		if (
			nodeIsKind<ts.CallExpression>(node, 'CallExpression') &&
			nodeIsKind<ts.Identifier>(node.expression, 'Identifier')
		) {
			checkFunctionName(ctx, node.expression);
		}
		return ts.forEachChild(node, cb);
	});
}

const whitelist = [
	'Array',
	'Boolean',
	'Error',
	'Function',
	'Number',
	'Object',
	'String'
];

function checkFunctionName(ctx: Lint.WalkContext<void>, name: ts.Identifier) {
	const firstLetter = name.text.charAt(0);
	if (firstLetter !== firstLetter.toLowerCase() && whitelist.indexOf(name.text) === -1) {
		ctx.addFailureAtNode(name, 'local function names should be camelCase');
	}
}
