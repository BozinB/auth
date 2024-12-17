import { UserController } from '../controllers/user.controller.js';

export const Routes = async (app) => {
  app.post('/users', async (request, reply) => {
    try {
      const clientApiKey = request.headers['api-key'];
      const user = await UserController.createUser(request.body, clientApiKey);
      reply.send({ message: 'User created successfully', userId: user._id });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  });

  app.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        reply.status(400).send({ error: 'Email and password are required' });
        return;
      }

      const user = await UserController.loginUser({ email, password });
      reply.send(user);
    } catch (error) {
      reply.status(401).send({ error: error.message });
    }
  });

  app.delete('/users/:id', async (request, reply) => {
    try {
      const clientApiKey = request.headers['api-key'];
      if (clientApiKey !== process.env.API_KEY) {
        return reply.status(403).send({ error: 'Forbidden: Invalid API key' });
      }

      // Extract user ID from the request params
      const { id } = request.params;

      // Delegate deletion to the controller
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


