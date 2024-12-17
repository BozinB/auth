import Fastify from 'fastify';
import { Routes } from './routes/auth.routes.js';
import mongoose from 'mongoose';
import { config } from './config/config.js';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { AuthService } from './services/auth.service.js';
import compress from '@fastify/compress';

const app = Fastify({
  logger: true,
  http2: true,
});

app.register(compress, { global: true });
app.register(Routes);

// gRPC Configuration
const PROTO_PATH = './src/proto/auth.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcPackage = grpc.loadPackageDefinition(packageDefinition).auth;

// Initialize gRPC server
const grpcServer = new grpc.Server();
grpcServer.addService(grpcPackage.AuthService.service, AuthService);

export const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Start HTTP server
    await app.listen({ port: config.app.port, host: '0.0.0.0' });
    console.log(`HTTP server running on port ${config.app.port}`);

    // Start gRPC server
    grpcServer.bindAsync(
      `0.0.0.0:${config.grpc.port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error('Failed to start gRPC server:', err);
          process.exit(1);
        }
        grpcServer.start();
        console.log(`gRPC server running on port ${port}`);
      }
    );
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};
