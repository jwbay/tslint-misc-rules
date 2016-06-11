import { Node } from 'typescript';

export default function getLeadingWhitespace(node: Node) {
	return node.getFullText().slice(0, node.getStart() - node.getFullStart());
}