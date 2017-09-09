import * as ts from 'typescript';

export function getJsxAttributes(node: ts.JsxOpeningLikeElement): ts.NodeArray<ts.JsxAttribute> {
	return (node.attributes && node.attributes as any).properties || // >= TS 2.3
		(node.attributes as any); // <= TS 2.2
}
