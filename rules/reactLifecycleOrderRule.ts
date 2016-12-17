import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import getClassMethods from '../helpers/getClassMethods';

export class Rule extends Lint.Rules.AbstractRule {
	public apply(sourceFile: ts.SourceFile) {
		return this.applyWithWalker(new ReactLifecyleOrderRule(sourceFile, this.getOptions()));
	}
}

const defaultOrder = [
	'componentWillMount',
	'render',
	'componentDidMount',
	'componentWillReceiveProps',
	'shouldComponentUpdate',
	'componentWillUpdate',
	'componentDidUpdate',
	'componentWillUnmount'
];

class ReactLifecyleOrderRule extends Lint.RuleWalker {
	private expectedOrder: string[];

	public constructor(sourceFile, options) {
		super(sourceFile, options);
		const orderOptions = this.getOptions();
		this.expectedOrder = orderOptions && orderOptions.length > 0
			? orderOptions
			: defaultOrder;
	}

	public visitClassDeclaration(node: ts.ClassDeclaration) {
		this.validate(node);
		super.visitClassDeclaration(node);
	}

	public visitClassExpression(node: ts.ClassExpression) {
		this.validate(node);
		super.visitClassExpression(node);
	}

	private validate(node: ts.ClassLikeDeclaration) {
		const relevantMethods = getClassMethods(node)
			.filter(method => this.expectedOrder.indexOf(method.name.getText()) > -1);

		const sortedMethods = relevantMethods.slice().sort((left, right) => {
			const leftName = left.name.getText();
			const rightName = right.name.getText();
			return this.expectedOrder.indexOf(leftName) > this.expectedOrder.indexOf(rightName) ? 1 : -1;
		});

		relevantMethods.forEach((method, index) => {
			if (sortedMethods[index] !== method) {
				this.addFailure(
					this.createFailure(
						method.name.getStart(),
						method.name.getWidth(),
						`expected React lifecyle method '${sortedMethods[index].name.getText()}'`
					)
				);
			}
		});
	}
}
