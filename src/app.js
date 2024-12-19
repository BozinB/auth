import Fastify from 'fastify';
import { Routes } from './routes/auth.routes.js';
import mongoose from 'mongoose';
import { config } from './config/config.js';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { AuthService } from './services/auth.service.js';
import compress from '@fastify/compress';
import pino from 'pino';

const isProduction = config.nodeEnv === 'production';



const app = Fastify({
  logger: {
    level: isProduction ? 'info' : 'debug',
    transport: !isProduction
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
  http2: true,
  allowHTTP1: true,
});


// Conditional compression
app.register(compress, {
  global: false,
});

// Register routes
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
    await mongoose.connect(config.database.uri, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    app.log.info('Connected to MongoDB');

    await app.listen({ port: config.app.port, host: config.app.host });
    app.log.info(`HTTP server running on port ${config.app.port}`);

    grpcServer.bindAsync(
      `0.0.0.0:${config.grpc.port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          app.log.error('Failed to start gRPC server:', err);
          process.exit(1);
        }
        grpcServer.start();
        app.log.info(`gRPC server running on port ${port}`);
      }
    );
  } catch (error) {
    app.log.error('Error starting the server:', error);
    process.exit(1);
  }
};
