import { validate } from '../utils/validate.js';
import { userSchema } from '../validation/user.validation.js';
import { UserRepository } from '../repositories/user.repository.js';
import { DuplicateUserError, InvalidApiKeyError } from '../utils/errors.js';

export const UserController = {
  createUser: async (userData, clientApiKey = null) => {
    // Validate input
    const validatedData = validate(userSchema, userData);

    const { client } = validatedData;

    if (clientApiKey !== process.env.API_KEY) {
      throw new InvalidApiKeyError();
    }

    // Check for duplicate user
    const existingUser = await UserRepository.findUserByEmailAndClient(validatedData.email, client);
    if (existingUser) {
      throw new DuplicateUserError();
    }

    // Create and save the user
    return UserRepository.createUser(validatedData);
  },

  loginUser: async ({ email, password }) => {
    // Find the user by email
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Return user data
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
    // Find and delete the user by ID
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
