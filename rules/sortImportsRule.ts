import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { graceful as detectNewline } from 'detect-newline';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new SortImportsWalker(sourceFile, this.getOptions()));
	}
}

class SortImportsWalker extends Lint.RuleWalker {
	public visitSourceFile(sf: ts.SourceFile) {
		for (const importGroup of this.getImportGroups(sf)) {
			const sortableLinesToImports = new Map<string, ts.ImportDeclaration>();
			const unsortedLines = importGroup.map(importDeclaration => {
				// opening brace is below alphanumeric characters char-code-wise, but want named imports above defaults
				// + comes directly after *, so swap with that
				const sortableLine = importDeclaration.getText(sf)
					.toLowerCase()
					.replace('import {', 'import +');
				sortableLinesToImports.set(sortableLine, importDeclaration);
				return sortableLine;
			});

			const sortedLines = unsortedLines.slice().sort();

			for (let i = 0; i < unsortedLines.length; i += 1) {
				if (
					unsortedLines[i] !== sortedLines[i] &&
					!this.isSideEffectImport(sortableLinesToImports.get(unsortedLines[i])) &&
					!this.isSideEffectImport(sortableLinesToImports.get(sortedLines[i]))
				) {
					const expectedImportIndex = this.findIndex(
						unsortedLines,
						line => line === sortedLines[i]
					);
					const expectedImport = importGroup[expectedImportIndex];
					const actualImport = importGroup[i];
					const message = this.getFailureMessage(expectedImport, actualImport);

					const sortedImports = sortedLines.map(line => {
						return sortableLinesToImports.get(line).getFullText(sf).trim();
					});

					const groupStart = importGroup[0].getStart(sf);
					const groupEnd = importGroup[importGroup.length - 1].getEnd();
					const newline = detectNewline(sf.getFullText());

					const fix = new Lint.Fix('sort-imports', [
						this.createReplacement(
							groupStart,
							groupEnd - groupStart,
							sortedImports.join(newline)
						)
					]);

					this.addFailure(
						this.createFailure(
							actualImport.getStart(sf),
							actualImport.getWidth(sf),
							message,
							fix
						)
					);
					break;
				}
			}
		}

		super.visitSourceFile(sf);
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

	private isSideEffectImport(node: ts.ImportDeclaration) {
		return (
			!this.isImportRequireStatement(node) &&
			!node.importClause
		);
	}
}
