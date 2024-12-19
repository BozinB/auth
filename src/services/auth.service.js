import { UserController } from '../controllers/user.controller.js';
import grpc from '@grpc/grpc-js';

export const AuthService = {
  CreateUser: async (call, callback) => {
    try {
      const clientApiKey = call.metadata.get('api-key')[0];
      const user = await UserController.createUser(call.request, clientApiKey);
      callback(null, { message: 'User created successfully', userId: user._id });
    } catch (error) {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: error.message,
      });
    }
  },

  LoginUser: async (call, callback) => {
    try {
      const { email, password } = call.request;
      if (!email || !password) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Email and password are required',
        });
      }

      const user = await UserController.loginUser({ email, password });
      callback(null, user);
    } catch (error) {
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: error.message,
      });
    }
  },

  DeleteUser: async (call, callback) => {
    try {
      const clientApiKey = call.metadata.get('api-key')[0];
      if (clientApiKey !== process.env.API_KEY) {
        return callback({
          code: grpc.status.PERMISSION_DENIED,
          message: 'Forbidden: Invalid API key',
        });
      }

      const { id } = call.request;
      const result = await UserController.deleteUser(id);
      callback(null, { message: 'User deleted successfully', result });
    } catch (error) {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: error.message,
      });
    }
  },

  GetAllUsers: async (call, callback) => {
    try {
      const users = await UserController.getAllUsers();
      callback(null, { users });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  },
};
