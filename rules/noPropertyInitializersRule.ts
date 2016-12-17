import * as Lint from 'tslint/lib';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new ClassMethodNewlinesWalker(sourceFile, this.getOptions()));
	}
}

class ClassMethodNewlinesWalker extends Lint.RuleWalker {
	public visitClassDeclaration(node: ts.ClassDeclaration) {
		super.visitClassDeclaration(node);
		this.validate(node);
	}

	public visitClassExpression(node: ts.ClassExpression) {
		super.visitClassExpression(node);
		this.validate(node);
	}

	private validate(node: ts.ClassLikeDeclaration) {
		for (const member of node.members) {
			if ((member as ts.PropertyDeclaration).initializer) {
				this.addFailure(
					this.createFailure(
						member.name.getStart(),
						member.name.getWidth(),
						'property initializers are nonstandard -- assign in constructor or method'
					)
				);
			}
		}
	}
}
