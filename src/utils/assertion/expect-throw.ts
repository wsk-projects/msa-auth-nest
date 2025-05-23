class ExpectBuilder {
  constructor(private condition: boolean) {}

  elseThrow(error: Error): void {
    if (!this.condition) {
      throw error;
    }
  }
}

export function expect(condition: boolean): ExpectBuilder {
  return new ExpectBuilder(condition);
}
