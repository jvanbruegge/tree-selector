export function permutations<T>(arr: T[]): T[][] {
    return arr
        .map(e => permutations(arr.slice(1)).map(arr => [e].concat(arr)))
        .reduce((acc, curr) => acc.concat(curr), []);
}
