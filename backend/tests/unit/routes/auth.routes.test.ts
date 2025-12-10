import request from 'supertest';
import express from 'express';
import authRoutes from '../../../src/routes/authRoutes';
import * as authController from '../../../src/controllers/authController';

jest.mock('../../../src/controllers/authController');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Unit Test: Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /register should call authController.register', async () => {
    (authController.register as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));

    await request(app).post('/api/auth/register').send({});
    
    expect(authController.register).toHaveBeenCalled();
  });

  it('POST /login should call authController.login', async () => {
    (authController.login as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));

    await request(app).post('/api/auth/login').send({});

    expect(authController.login).toHaveBeenCalled();
  });

  it('POST /forgot-password should call authController.forgotPassword', async () => {
    (authController.forgotPassword as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));

    await request(app).post('/api/auth/forgot-password').send({});

    expect(authController.forgotPassword).toHaveBeenCalled();
  });
});