import * as Lint from 'tslint/lib';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new SortImportsWalker(sourceFile, this.getOptions()));
	}
}

class SortImportsWalker extends Lint.RuleWalker {
	public visitSourceFile(node: ts.SourceFile) {
		for (const importGroup of this.getImportGroups(node)) {
			const importLines = importGroup.map(line => line.getText(node));
			const importLinesForComparison = importLines.map(line => line.toLowerCase().replace(' {', ' +'));
			const sortedImportLines = importLinesForComparison.slice().sort();

			for (let i = 0; i < importLines.length; i += 1) {
				if (importLinesForComparison[i] !== sortedImportLines[i]) {
					const expectedImportIndex = this.findIndex(
						importLinesForComparison,
						line => line === sortedImportLines[i]
					);
					const expectedImport = importGroup[expectedImportIndex];
					const actualImport = importGroup[i];
					const message = this.getFailureMessage(expectedImport, actualImport);
					this.addFailure(
						this.createFailure(
							actualImport.getStart(node),
							actualImport.getWidth(node),
							message
						)
					);
					break;
				}
			}
		}

		super.visitSourceFile(node);
	}

	private getImportGroups(sourceFile: ts.SourceFile) {
		let breakGroup = true;
		const importGroups: ts.ImportDeclaration[][] = [[]];

		for (const statement of sourceFile.statements) {
			if (this.isImportStatement(statement)) {
				importGroups[importGroups.length - 1].push(statement);
				breakGroup = true;
			} else if (breakGroup) {
				importGroups.push([]);
				breakGroup = false;
			}
		}

		return importGroups.filter(group => group.length > 0);
	}

	private findIndex(array: string[], predicate: (str: string) => boolean) {
		for (let i = 0; i < array.length; i += 1) {
			if (predicate(array[i])) {
				return i;
			}
		}
	}

	private isImportStatement(node: ts.Node): node is ts.ImportDeclaration {
		return (
			node.kind === ts.SyntaxKind.ImportDeclaration ||
			this.isImportRequireStatement(node)
		);
	}

	private getFailureMessage(expectedImport: ts.ImportDeclaration, actualImport: ts.ImportDeclaration) {
		const expected = this.getImportBindingName(expectedImport);
		const actual = this.getImportBindingName(actualImport);
		return `out-of-order imports: expected '${expected}' but saw '${actual}'`;
	}

	private getImportBindingName(node: ts.ImportDeclaration | ts.ImportEqualsDeclaration) {
		const sf = this.getSourceFile();
		if (this.isImportRequireStatement(node)) {
			return node.name.getText(sf);
		} else {
			if (node.importClause) {
				return node.importClause.getText(sf);
			}

			return node.moduleSpecifier.getText(sf);
		}
	}

	private isImportRequireStatement(node: ts.Node): node is ts.ImportEqualsDeclaration {
		return node.kind === ts.SyntaxKind.ImportEqualsDeclaration;
	}
}
