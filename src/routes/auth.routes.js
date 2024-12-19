import { UserController } from '../controllers/user.controller.js';

export const Routes = async (app) => {
  // Example schemas (adjust as needed)
  const createUserSchema = {
    body: {
      type: 'object',
      required: ['username', 'email', 'password', 'client'],
      properties: {
        username: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        client: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' }, default: ['user'] },
      },
    },
    headers: {
      type: 'object',
      properties: {
        'api-key': { type: 'string' },
      },
      required: ['api-key'],
    },
  };

  const loginUserSchema = {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
      },
    },
  };

  const deleteUserSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
    headers: {
      type: 'object',
      properties: {
        'api-key': { type: 'string' },
      },
      required: ['api-key'],
    },
  };

  app.post('/users', { schema: createUserSchema }, async (request, reply) => {
    try {
      const clientApiKey = request.headers['api-key'];
      const user = await UserController.createUser(request.body, clientApiKey);
      reply.send({ message: 'User created successfully', userId: user._id });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  });

  app.post('/login', { schema: loginUserSchema }, async (request, reply) => {
    try {
      const { email, password } = request.body;
      const user = await UserController.loginUser({ email, password });
      reply.send(user);
    } catch (error) {
      reply.status(401).send({ error: error.message });
    }
  });

  app.delete('/users/:id', { schema: deleteUserSchema }, async (request, reply) => {
    try {
      const clientApiKey = request.headers['api-key'];
      if (clientApiKey !== process.env.API_KEY) {
        return reply.status(403).send({ error: 'Forbidden: Invalid API key' });
      }
      const { id } = request.params;
      const result = await UserController.deleteUser(id);
      reply.send({ message: 'User deleted successfully', result });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  });

  app.get('/users', async (request, reply) => {
    try {
      const users = await UserController.getAllUsers();
      reply.send(users);
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
};
