import { Options } from '../src/index';

export interface VNode {
    tag: string;
    className?: string;
    attributes?: any;
    children?: (string | VNode)[];
    contents?: string;
    id?: string;
}

export const options: Options<VNode> = {
    tag: n => n.tag || '',
    className: n => n.className || '',
    attr: (n, attr) => n.attributes[attr] || '',
    children: n => n.children || [],
    contents: n => n.contents || '',
    id: n => n.id || ''
};
