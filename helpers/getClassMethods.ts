import * as ts from 'typescript'
import { nodeIsKind } from './nodeIsKind'

export function getClassMethods(node: ts.ClassLikeDeclaration) {
	if (!node.members) {
		return []
	}

	return node.members.filter(m => {
		if (nodeIsKind<ts.MethodDeclaration>(m, 'MethodDeclaration')) {
			return true
		}

		if (nodeIsKind<ts.PropertyDeclaration>(m, 'PropertyDeclaration')) {
			return nodeIsKind(m.initializer, 'ArrowFunction')
		}

		return false
	}) as (ts.MethodDeclaration | ts.PropertyDeclaration)[]
}
