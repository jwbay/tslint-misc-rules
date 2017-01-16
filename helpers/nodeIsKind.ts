import * as ts from 'typescript';

export default function nodeIsType<T extends ts.Node>(
	node: ts.Node,
	getKind: (k: typeof ts.SyntaxKind) => ts.SyntaxKind
): node is T {
	return !!node && node.kind === getKind(ts.SyntaxKind);
}
