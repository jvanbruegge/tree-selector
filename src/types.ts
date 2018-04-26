export interface Options<T> {
    tag: (n: T) => string;
    contents: (n: T) => string;
    id: (n: T) => string;
    className: (n: T) => string;
    parent: (n: T) => T | undefined;
    children: (n: T) => (T | string)[];
    attr: (n: T, name: string) => string;
}
