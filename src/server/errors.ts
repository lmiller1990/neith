export class OrganizationExistsError extends Error {
  constructor(email: string) {
    super(`Organization with email ${email} already exists.`);
  }
}
