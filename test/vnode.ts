import { Options } from '../src/index';

export interface VNode {
    tag: string;
    className?: string;
    attributes?: any;
    children?: (string | VNode | undefined | null)[];
    contents?: string;
    parent?: VNode;
    id?: string;
}

export const options: Options<VNode> = {
    tag: n => n.tag || '',
    className: n => n.className || '',
    attr: (n, attr) => n.attributes[attr] || '',
    parent: n => n.parent,
    children: n => n.children || [],
    contents: n => n.contents || '',
    id: n => n.id || ''
};
