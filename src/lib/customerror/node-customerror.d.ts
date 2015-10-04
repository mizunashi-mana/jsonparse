export declare class BaseCustomError extends Error{
  constructor(message?: string);
  protected initializeError(c: Function): void;
}
