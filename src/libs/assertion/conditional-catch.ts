type AsyncFn<T> = () => Promise<T>;

class AttemptBuilder<T = unknown> {
  private fn: AsyncFn<T>;
  private expectedError?: new (...args: any[]) => Error;
  private replacementError?: Error;
  private fallbackError?: Error;

  constructor(fn: AsyncFn<T>) {
    this.fn = fn;
  }

  expect(errorType: new (...args: any[]) => Error) {
    this.expectedError = errorType;
    return this;
  }

  thenThrow(replacementError: Error) {
    this.replacementError = replacementError;
    return this;
  }

  elseThrow(error: Error): Promise<T> {
    this.fallbackError = error;
    return this.execute();
  }

  private async execute(): Promise<T> {
    try {
      return await this.fn();
    } catch (err: any) {
      const isExpected = this.expectedError && err instanceof this.expectedError;
      if (isExpected && this.replacementError) {
        throw this.replacementError;
      }
      if (this.fallbackError) {
        throw this.fallbackError;
      }
      throw err;
    }
  }
}

export function attempt<T>(fn: AsyncFn<T>) {
  return new AttemptBuilder<T>(fn);
}
