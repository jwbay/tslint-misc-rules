import * as ts from 'typescript';

export function nodeIsKind<T extends ts.Node>(
	node: ts.Node,
	kind: keyof typeof ts.SyntaxKind,
): node is T {
	return node && node.kind === ts.SyntaxKind[kind];
}
