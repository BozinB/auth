import { User } from '../models/user.model.js';

export const UserRepository = {
  createUser: async (userData) => {
    const user = new User(userData);
    return user.save();
  },

  findUserByEmailAndClient: async (email, client) => {
    return User.findOne({ email, client });
  },

  findUserByEmail: async (email) => {
    return User.findOne({ email }).exec();
  },

  findUserById: async (id) => {
    return User.findById(id).exec();
  },

  deleteUserById: async (id) => {
    return User.findByIdAndDelete(id).exec();
  },

  getAllUsers: async () => {
    return User.find({}).exec();
  },

};

