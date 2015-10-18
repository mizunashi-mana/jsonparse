/**
 * clone util function
 *
 * @param obj source object
 * @param deepcopy is deep copying?
 * @returns clone object of source
 */
export declare function clone<T>(obj: T, deepcopy?: boolean): T;

export declare function cloneObj<T>(obj: T): T;

export declare function inherits<T, U>(ctor: T, superCtor: U): T & U;
