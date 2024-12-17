import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    client: {
      type: String,
      required: true, 
      index: true, 
    },
    username: {
      type: String,
      required: true, 
      trim: true, 
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, 
    },
    roles: {
      type: [String],
      default: ['user'], 
    },
    isActive: {
      type: Boolean,
      default: true, 
    },
    metadata: {
      type: Map,
      of: String, 
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique client-email and client-username
userSchema.index({ client: 1, username: 1 }, { unique: true });
userSchema.index({ client: 1, email: 1 }, { unique: true });

// Pre-save hook for password hashing
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const bcrypt = await import('bcrypt');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to check passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User Model
export const User = mongoose.model('User', userSchema);
