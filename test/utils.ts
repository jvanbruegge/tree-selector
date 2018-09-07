import { VNode } from './vnode';

export function addParents(node: VNode | undefined | null): VNode | undefined | null {
    if(node) {
        node.children = !node.children
            ? undefined
            : node.children.map(
                  (c: any) =>
                      typeof c !== 'object' ? c : { ...addParents(c), parent: node }
              );
    }
    return node;
}
