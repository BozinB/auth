export class DuplicateUserError extends Error {
  constructor(message = 'User already exists for this client') {
    super(message);
    this.name = 'DuplicateUserError';
  }
}

export class InvalidApiKeyError extends Error {
  constructor(message = 'Admin role requires a valid API key') {
    super(message);
    this.name = 'InvalidApiKeyError';
  }
}
