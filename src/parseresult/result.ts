export enum ResultType {Success, Failure}

export class ParseResult<T> {
  private t: ResultType;
  private v: T;

  constructor(type: ResultType, value?: T) {
    this.t = type;
    this.v = value;
  }

  static success<T>(value: T) {
    return new ParseResult<T>(ResultType.Success, value);
  }

  static fail<T>() {
    return new ParseResult<T>(ResultType.Failure);
  }

  static result<T>(value?: T) {
    return (value === null || value === undefined)
      ? ParseResult.fail<T>()
      : ParseResult.success<T>(value)
      ;
  }

  static bind2<T1, T2, T3>(
    f: (arg1: T1, arg2: T2) => ParseResult<T3>
  ) {
    return (
      res1: ParseResult<T1>,
      res2: ParseResult<T2>
    ) => {
      return res1.chain<T3>((val1) => {
        return res2.chain<T3>((val2) => {
          return f(val1, val2);
        });
      });
    };
  }

  isSuccess(): boolean {
    return this.t === ResultType.Success;
  }

  chain<U>(f: (t: T) => ParseResult<U>) {
    return this.isSuccess()
      ? f(this.v)
      : ParseResult.fail<U>()
      ;
  }

  of<U>(u: U) {
    return ParseResult.result<U>(u);
  }

  lift<U>(f: (t: T) => U) {
    return this.chain((val) => this.of<U>(f(val)));
  }
}
