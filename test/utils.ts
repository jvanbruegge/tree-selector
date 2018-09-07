import { VNode } from './vnode';

export function addParents(node: VNode): VNode {
    node.children = !node.children
        ? undefined
        : node.children.map(
              c =>
                  typeof c === 'string' ? c : { ...addParents(c), parent: node }
          );
    return node;
}
