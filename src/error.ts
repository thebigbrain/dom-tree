export class FatalError extends Error {
  public name: string = 'FatalError';

  constructor(message?: string) {
    super();
    this.message = message || '';
  }
}
