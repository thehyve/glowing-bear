export class UserInputError extends Error {
  constructor(message: string) {
    super(message);
    // needed to extent Error: https://ashsmith.io/handling-custom-error-classes-in-typescript
    Object.setPrototypeOf(this, UserInputError.prototype)

    this.name = 'UserInputError';
  }
}
