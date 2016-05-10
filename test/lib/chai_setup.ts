/// <reference path="typings.ts" />

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function assertThrow(
  fn: () => any,
  err?: Function,
  msg?: string|RegExp
) {
  const regMsg = typeof msg === 'string'
    ? new RegExp(`(^| )${escapeRegExp(msg)}( |$)`)
    : msg
    ;
  return chai.assert.throw(fn, err, regMsg);
}

export type Thenablable<T> = PromisesAPlus.Thenable<T> | T;

export function promiseAll<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  promises: [
    Thenablable<T1>, Thenablable<T2>, Thenablable<T3>, Thenablable<T4>,
    Thenablable<T5>, Thenablable<T6>, Thenablable<T7>, Thenablable<T8>,
    Thenablable<T9>, Thenablable<T10>]
): PromisesAPlus.Thenable<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
export function promiseAll<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  promises: [
    Thenablable<T1>, Thenablable<T2>, Thenablable<T3>, Thenablable<T4>,
    Thenablable<T5>, Thenablable<T6>, Thenablable<T7>, Thenablable<T8>,
    Thenablable<T9>]
): PromisesAPlus.Thenable<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
export function promiseAll<T1, T2, T3, T4, T5, T6, T7, T8>(
  promises: [
    Thenablable<T1>, Thenablable<T2>, Thenablable<T3>, Thenablable<T4>,
    Thenablable<T5>, Thenablable<T6>, Thenablable<T7>, Thenablable<T8>]
): PromisesAPlus.Thenable<[T1, T2, T3, T4, T5, T6, T7, T8]>;
export function promiseAll<T1, T2, T3, T4, T5, T6, T7>(
  promises: [
    Thenablable<T1>, Thenablable<T2>, Thenablable<T3>, Thenablable<T4>,
    Thenablable<T5>, Thenablable<T6>, Thenablable<T7>]
): PromisesAPlus.Thenable<[T1, T2, T3, T4, T5, T6, T7]>;
export function promiseAll<T1, T2, T3, T4, T5, T6>(
  promises: [
    Thenablable<T1>, Thenablable<T2>, Thenablable<T3>, Thenablable<T4>,
    Thenablable<T5>, Thenablable<T6>]
): PromisesAPlus.Thenable<[T1, T2, T3, T4, T5, T6]>;
export function promiseAll<T1, T2, T3, T4, T5>(
  promises: [
    Thenablable<T1>, Thenablable<T2>, Thenablable<T3>, Thenablable<T4>,
    Thenablable<T5>]
): PromisesAPlus.Thenable<[T1, T2, T3, T4, T5]>;
export function promiseAll<T1, T2, T3, T4>(
  promises: [
    Thenablable<T1>, Thenablable<T2>, Thenablable<T3>, Thenablable<T4>]
): PromisesAPlus.Thenable<[T1, T2, T3, T4]>;
export function promiseAll<T1, T2, T3>(
  promises: [Thenablable<T1>, Thenablable<T2>, Thenablable<T3>]
): PromisesAPlus.Thenable<[T1, T2, T3]>;
export function promiseAll<T1, T2>(
  promises: [Thenablable<T1>, Thenablable<T2>]
): PromisesAPlus.Thenable<[T1, T2]>;
export function promiseAll<T>(promises: Thenablable<T>[]): PromisesAPlus.Thenable<T[]>;
export function promiseAll(promises: any[]): PromisesAPlus.Thenable<any[]> {
  return Promise.all(promises);
}

export {
  assert
} from 'chai';
