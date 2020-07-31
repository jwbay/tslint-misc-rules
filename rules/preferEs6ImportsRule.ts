import * as Lint from 'tslint/lib'
import * as ts from 'typescript'
import { nodeIsKind } from '../helpers/nodeIsKind'

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(
			new PreferEs6ImportsWalker(sourceFile, this.getOptions())
		)
	}
}

class PreferEs6ImportsWalker extends Lint.RuleWalker {
	public visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration) {
		const sf = this.getSourceFile()
		const { moduleReference } = node
		const bannedModuleRequires: string[] = this.getOptions()

		if (
			nodeIsKind<ts.ExternalModuleReference>(
				moduleReference,
				'ExternalModuleReference'
			) &&
			nodeIsKind(moduleReference.expression, 'StringLiteral')
		) {
			const modulePath = moduleReference.expression.getText(sf)
			const moduleName = modulePath
				.split(/[\/\\]+/)
				.pop()
				.replace(/['"]/g, '')

			if (bannedModuleRequires.some((banned) => moduleName === banned)) {
				this.addFailure(
					this.createFailure(
						node.getStart(sf),
						node.getWidth(sf),
						`use es6 import syntax when importing ${moduleName}`
					)
				)
			}
		}

		super.visitImportEqualsDeclaration(node)
	}
}
