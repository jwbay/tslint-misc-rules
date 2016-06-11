import * as ts from 'typescript';

export default function getClassMethods(node: ts.ClassLikeDeclaration) {
	if (!node.members) {
		return [];
	}

	return node.members.filter(m => m.kind === ts.SyntaxKind.MethodDeclaration) as ts.MethodDeclaration[];
}