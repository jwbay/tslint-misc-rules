import * as Lint from 'tslint/lib'
import * as ts from 'typescript'
import { nodeIsKind } from '../helpers/nodeIsKind'

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(
			new Walker(sourceFile, this.ruleName, this.getOptions())
		)
	}
}

class Walker extends Lint.AbstractWalker<{}> {
	public walk(sourceFile: ts.SourceFile) {
		const cb = (node: ts.Node): void => {
			if (nodeIsKind<ts.ArrowFunction>(node, 'ArrowFunction')) {
				this.validate(node)
			}
			return ts.forEachChild(node, cb)
		}

		ts.forEachChild(sourceFile, cb)
	}

	private validate(node: ts.ArrowFunction) {
		const { body } = node

		if (
			this.functionBodyIsBraced(body) &&
			this.functionBodyHasOneStatement(body) &&
			this.functionBodyIsOneLine(body)
		) {
			this.addFailureAtNode(
				body,
				'single-line arrow functions should not be wrapped in braces',
				Lint.Replacement.replaceNode(body, this.getFixedText(body))
			)
		}
	}

	private functionBodyIsBraced(node: ts.ConciseBody): node is ts.Block {
		return nodeIsKind(node, 'Block')
	}

	private functionBodyHasOneStatement(node: ts.Block) {
		return node.statements.length === 1
	}

	private functionBodyIsOneLine(node: ts.Block) {
		const bodyText = node.getFullText(this.getSourceFile())
		return !/\n/.test(bodyText)
	}

	private getFixedText(node: ts.Block) {
		const sf = this.getSourceFile()
		const body = node.getChildAt(1, sf)
		let result = this.stripSemicolon(body.getText(sf))

		const statement = body.getChildAt(0, sf)
		if (nodeIsKind(statement, 'ReturnStatement')) {
			result = result.replace('return', '').trim()

			const returnExpression = statement.getChildAt(1, sf)
			if (nodeIsKind(returnExpression, 'ObjectLiteralExpression')) {
				result = `(${result})`
			}
		}

		return result
	}

	private stripSemicolon(text: string) {
		return text.trim().replace(/;$/, '')
	}
}
