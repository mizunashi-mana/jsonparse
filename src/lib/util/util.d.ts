/**
 * clone util function
 *
 * @param obj source object
 * @param deepcopy is deep copying?
 * @returns clone object of source
 */
export declare function clone<T>(obj: T, deepcopy?: boolean): T;

/**
 * clone util function for JSON Object
 *
 * this is fast and safe, but maybe throw Error on receiving function object
 *
 * @param obj source object
 * @returns clone object of source
 */
export declare function cloneObj<T>(obj: T): T;

/**
 * fork of node util inherits
 *
 * @param ctor base constructor
 * @param superCtor extends super constructor
 * @returns constructor extended superCtor to ctor
 */
export declare function inherits<T, U>(ctor: T, superCtor: U): T & U;
