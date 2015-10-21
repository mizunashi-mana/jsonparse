import {clone} from "./util";

/**
 * A builder of repeat string
 *
 * @param count repeat count
 * @param str source string
 * @returns repeated string
 */
export function repeat(count: number, str: string): string {
  if (count <= 0) {
    return "";
  }
  const repU = repeat(Math.floor(count / 2), str);
  return repU + repU + ((count % 2) == 1 ? str : "");
}

/**
 * A builder of escape string for regexp
 *
 * @param str source string
 * @returns escaping source
 */
export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Id wrapper
 *
 * @param a source object
 * @returns clone object of source
 */
export function id<T>(a: T) {
  return clone(a, true);
}

/**
 * A checker value exists
 *
 * @param a source object
 * @returns is exists
 */
export function exists<T>(a: T) {
  return a !== null && a !== undefined;
}
