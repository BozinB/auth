import axios from 'axios';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

// Configuration
const HTTP_URL = 'http://localhost:8001/users'; // HTTP endpoint for fetching all users
const GRPC_URL = 'localhost:50051'; // gRPC endpoint
const PROTO_PATH = './src/proto/auth.proto'; // Path to your proto file
const REQUESTS_COUNT = 20000; // Number of requests to send

// Load gRPC Client
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcPackage = grpc.loadPackageDefinition(packageDefinition).auth;
const grpcClient = new grpcPackage.AuthService(
  GRPC_URL,
  grpc.credentials.createInsecure()
);

// Benchmark HTTP GET /users
const testHttpGetAllUsers = async () => {
  console.log('Starting HTTP benchmark for fetching all users...');
  const start = Date.now();

  const promises = [];
  for (let i = 0; i < REQUESTS_COUNT; i++) {
    promises.push(
      axios
        .get(HTTP_URL)
        .then((response) => response.data)
        .catch((err) => err.response?.status || 'error')
    );
  }

  await Promise.all(promises);
  const end = Date.now();
  console.log(`HTTP GET /users benchmark completed. Time taken: ${end - start} ms`);
};

// Benchmark gRPC GetAllUsers
const testGrpcGetAllUsers = async () => {
  console.log('Starting gRPC benchmark for fetching all users...');
  const start = Date.now();

  const promises = [];
  for (let i = 0; i < REQUESTS_COUNT; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        grpcClient.GetAllUsers({}, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
      })
    );
  }

  await Promise.all(promises);
  const end = Date.now();
  console.log(`gRPC GetAllUsers benchmark completed. Time taken: ${end - start} ms`);
};

// Run Benchmarks
const runBenchmarks = async () => {
  console.log(`Running ${REQUESTS_COUNT} requests for each method...\n`);

  // Test fetching all users over HTTP
  await testHttpGetAllUsers();
  console.log('--------------------------------');

  // Test fetching all users over gRPC
  await testGrpcGetAllUsers();
  console.log('--------------------------------');

  console.log('Benchmark completed.');
};

runBenchmarks().catch(console.error);
