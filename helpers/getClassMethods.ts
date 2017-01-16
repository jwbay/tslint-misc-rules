import * as ts from 'typescript';
import nodeIsKind from './nodeIsKind';

export default function getClassMethods(node: ts.ClassLikeDeclaration) {
	if (!node.members) {
		return [];
	}

	return node.members.filter(m => {
		if (nodeIsKind<ts.MethodDeclaration>(m, k => k.MethodDeclaration)) {
			return true;
		}

		if (nodeIsKind<ts.PropertyDeclaration>(m, k => k.PropertyDeclaration)) {
			return nodeIsKind(m.initializer, k => k.ArrowFunction);
		}

		return false;
	}) as (ts.MethodDeclaration | ts.PropertyDeclaration)[];
}