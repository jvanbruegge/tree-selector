export interface Options<T> {
    tag: (n: T) => string;
    contents: (n: T) => string;
    id: (n: T) => string;
    className: (n: T) => string;
    children: (n: T) => (T | string)[];
    attr: (n: T, name: string) => string;
}
