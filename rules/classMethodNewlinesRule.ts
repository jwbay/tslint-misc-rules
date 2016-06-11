import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import getClassMethods from '../helpers/getClassMethods';
import getLeadingWhitespace from '../helpers/getLeadingWhitespace';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new ClassMethodNewlinesWalker(sourceFile, this.getOptions()));
	}
}

class ClassMethodNewlinesWalker extends Lint.RuleWalker {
	public visitClassDeclaration(node: ts.ClassDeclaration) {
		this.validate(node);
		super.visitClassDeclaration(node);
	}

	public visitClassExpression(node: ts.ClassExpression) {
		this.validate(node);
		super.visitClassExpression(node);
	}

	private validate(node: ts.ClassLikeDeclaration) {
		for (const method of getClassMethods(node)) {
			const newlines = getLeadingWhitespace(method).match(/\n/g).length;
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
}