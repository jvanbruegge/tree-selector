import { VNode } from './vnode';

export function permutations<T>(arr: T[]): T[][] {
    return arr
        .map(e => permutations(arr.slice(1)).map(arr => [e].concat(arr)))
        .reduce((acc, curr) => acc.concat(curr), []);
}

export function addParents(node: VNode): VNode {
    node.children = !node.children
        ? undefined
        : node.children.map(
              c =>
                  typeof c === 'string' ? c : { ...addParents(c), parent: node }
          );
    return node;
}
