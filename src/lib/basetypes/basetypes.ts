export interface Eq<T> {
  equals(t: T): boolean;
}

export interface Monoid<T> {
  mempty: Monoid<T>;
  empty: Monoid<T>;
  mappend(t: Monoid<T>): Monoid<T>;
  append(t: Monoid<T>): Monoid<T>;
  mconcat(t: Monoid<T>[]): Monoid<T>;
  concat(t: Monoid<T>[]): Monoid<T>;
}

export interface Functor<T> {
  fmap<U>(f: (t: T) => U): Functor<U>;
  lift<U>(f: (t: T) => U): Functor<U>;
  map<U>(f: (t: T) => U): Functor<U>;
}

export interface Applicative<T> extends Functor<T> {
  ap<U>(u: Applicative<(t: T) => U>): Applicative<U>;
  of<U>(t: U): Applicative<U>;
  unit<U>(t: U): Applicative<U>;
}

export interface Monad<T> extends Applicative<T> {
  unit<U>(t: U): Monad<U>;
  of<U>(t: U): Monad<U>;
  bind<U>(f: (t: T) => Monad<U>): Monad<U>;
  chain<U>(f: (t: T) => Monad<U>): Monad<U>;
}

export interface MonadPlus<T> extends Monad<T> {
  mzero: MonadPlus<T>;
  zero: MonadPlus<T>;
  mplus(t: MonadPlus<T>): MonadPlus<T>;
  plus(t: MonadPlus<T>): MonadPlus<T>;
}
