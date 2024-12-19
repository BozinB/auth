import { validate } from '../utils/validate.js';
import { userSchema } from '../validation/user.validation.js';
import { UserRepository } from '../repositories/user.repository.js';
import { DuplicateUserError, InvalidApiKeyError } from '../utils/errors.js';

export const UserController = {
  createUser: async (userData, clientApiKey = null) => {
    const validatedData = validate(userSchema, userData);

    if (clientApiKey !== process.env.API_KEY) {
      throw new InvalidApiKeyError();
    }

    const { email, client } = validatedData;

    const existingUser = await UserRepository.findUserByEmailAndClient(email, client);
    if (existingUser) {
      throw new DuplicateUserError();
    }

    return UserRepository.createUser(validatedData);
  },

  loginUser: async ({ email, password }) => {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return {
      username: user.username,
      client: user.client,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      metadata: user.metadata,
    };
  },

  deleteUser: async (userId) => {
    const deletedUser = await UserRepository.deleteUserById(userId);
    if (!deletedUser) {
      throw new Error('User not found');
    }
    return deletedUser;
  },

  getAllUsers: async () => {
    return UserRepository.getAllUsers();
  },
};
