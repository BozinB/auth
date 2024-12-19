import { User } from '../models/user.model.js';

export const UserRepository = {
  createUser: async (userData) => {
    const user = new User(userData);
    return user.save();
  },

  findUserByEmailAndClient: (email, client) => {
    return User.findOne({ email, client }).exec();
  },

  findUserByEmail: (email) => {
    return User.findOne({ email }).exec();
  },

  findUserById: (id) => {
    return User.findById(id).exec();
  },

  deleteUserById: (id) => {
    return User.findByIdAndDelete(id).exec();
  },

  getAllUsers: () => {
    // Consider limiting fields if not all are needed:
    // return User.find({}, 'username client email roles isActive').exec();
    return User.find({}).exec();
  },
};
