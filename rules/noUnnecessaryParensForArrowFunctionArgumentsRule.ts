import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new NoUnnecessaryParensForArrowFunctionArgumentsWalker(sourceFile, this.getOptions()));
	}
}

class NoUnnecessaryParensForArrowFunctionArgumentsWalker extends Lint.RuleWalker {
	protected visitArrowFunction(node: ts.ArrowFunction) {
		super.visitArrowFunction(node);
		if (node.parameters.length !== 1) {
			return;
		}

		const param = node.parameters[0];
		const hasParens = this.argumentsAreWrappedInParens(node);
		const hasType = this.hasTypeAnnotation(param);
		const isDestructured = this.isDestructured(param);
		const isRest = this.isRestParameter(param);
		const hasDefaultValue = this.hasDefaultValue(param);

		if (hasParens && !(hasType || isDestructured || isRest || hasDefaultValue)) {
			this.addFailure(
				this.createFailure(
					node.getStart(this.getSourceFile()),
					1,
					'arrow functions with one argument should not have parentheses around the argument'
				)
			);
		}
	}

	private argumentsAreWrappedInParens(node: ts.ArrowFunction) {
		return node.getText(this.getSourceFile()).indexOf('(') === 0;
	}

	private hasTypeAnnotation(param: ts.ParameterDeclaration) {
		return !!param.type;
	}

	private isDestructured(param: ts.ParameterDeclaration) {
		return param.name.kind === ts.SyntaxKind.ObjectBindingPattern ||
			param.name.kind === ts.SyntaxKind.ArrayBindingPattern ||
			param.name.kind === ts.SyntaxKind.BindingElement;
	}

	private isRestParameter(param: ts.ParameterDeclaration) {
		return !!param.dotDotDotToken;
	}

	private hasDefaultValue(param: ts.ParameterDeclaration) {
		return !!param.initializer;
	}
}