import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new ClassMethodNewlinesWalker(sourceFile, this.getOptions()));
	}
}

type classType = ts.ClassDeclaration | ts.ClassExpression;

class ClassMethodNewlinesWalker extends Lint.RuleWalker {
	public visitClassDeclaration(node: ts.ClassDeclaration) {
		this.validate(node);
		super.visitClassDeclaration(node);
	}

	public visitClassExpression(node: ts.ClassExpression) {
		this.validate(node);
		super.visitClassExpression(node);
	}

	private validate(node: classType) {
		for (const method of this.getMethods(node)) {
			const newlines = this.getLeadingWhitespace(method).match(/\n/g).length;
			const valid = method === node.members[0]
				? newlines === 1
				: newlines === 2;

			if (!valid) {
				const methodStart = method.getStart();
				this.addFailure(
					this.createFailure(
						methodStart,
						method.body.getStart() - methodStart - 1,
						'class methods should be preceded by an empty line'
					)
				);
			}
		}
	}

	private getMethods(node: classType) {
		if (!node.members) {
			return [];
		}

		return node.members.filter(m => m.kind === ts.SyntaxKind.MethodDeclaration) as ts.MethodDeclaration[];
	}

	private getLeadingWhitespace(node: ts.Node) {
		return node.getFullText().slice(0, node.getStart() - node.getFullStart());
	}
}