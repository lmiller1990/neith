export class OrganizationExistsError extends Error {
  constructor(email: string) {
    super(`Organization with email ${email} already exists.`);
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super(`Email or password is incorrect.`);
  }
}
