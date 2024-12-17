import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    port: process.env.PORT || 8001,
  },
  grpc: {
    port: process.env.GRPC_PORT || 50051,
  },
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/authDB',
  },
  apiKey: process.env.API_KEY,
};
