import * as Lint from 'tslint/lib';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new PreferEs6ImportsWalker(sourceFile, this.getOptions()));
	}
}

type moduleReference = ts.Identifier | ts.QualifiedName | ts.ExternalModuleReference;

class PreferEs6ImportsWalker extends Lint.RuleWalker {
	public visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration) {
		const moduleReference = node.moduleReference as ts.ExternalModuleReference;
		const bannedModuleRequires: string[] = this.getOptions();

		if (
			this.isExternalModuleReference(moduleReference) &&
			this.isStringLiteralExpression(moduleReference.expression)
		) {
			const modulePath = moduleReference.expression.getText();
			const moduleName = modulePath.split(/[\/\\]+/).pop().replace(/['"]/g, '');

			if (bannedModuleRequires.some(banned => moduleName === banned)) {
				this.addFailure(
					this.createFailure(
						node.getStart(),
						node.getWidth(),
						`use es6 import syntax when importing ${moduleName}`
					)
				);
			}
		}

		super.visitImportEqualsDeclaration(node);
	}

	private isExternalModuleReference(node: moduleReference) {
		return node.kind === ts.SyntaxKind.ExternalModuleReference;
	}

	private isStringLiteralExpression(node: ts.Expression) {
		return node.kind === ts.SyntaxKind.StringLiteral;
	}
}
