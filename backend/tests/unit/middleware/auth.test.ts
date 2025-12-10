import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, authenticateTokenOptional, requireAdmin } from '../../../src/middleware/auth';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            cookies: {},
            user: undefined
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('authenticateToken', () => {
        it('should return 401 if no token is provided', () => {
            authenticateToken(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next and set req.user if token is valid', () => {
            req.cookies = { jwt: 'valid_token' };
            const mockUser = { id: '123', is_admin: false };
            (jwt.verify as jest.Mock).mockReturnValue(mockUser);

            authenticateToken(req as Request, res as Response, next);

            expect(jwt.verify).toHaveBeenCalled();
            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalled();
        });

        it('should return 400 if token is invalid', () => {
            req.cookies = { jwt: 'invalid_token' };
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            authenticateToken(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('authenticateTokenOptional', () => {
        it('should call next with req.user undefined if no token provided', () => {
            authenticateTokenOptional(req as Request, res as Response, next);

            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });

        it('should call next and set req.user if token is valid', () => {
            req.cookies = { jwt: 'valid_token' };
            const mockUser = { id: '123', is_admin: false };
            (jwt.verify as jest.Mock).mockReturnValue(mockUser);

            authenticateTokenOptional(req as Request, res as Response, next);

            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalled();
        });

        it('should call next with req.user undefined if token is invalid', () => {
            req.cookies = { jwt: 'invalid_token' };
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            authenticateTokenOptional(req as Request, res as Response, next);

            expect(console.warn).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });
    });

    describe('requireAdmin', () => {
        it('should return 403 if req.user is undefined', () => {
            requireAdmin(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Admin required' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 if user is not admin', () => {
            req.user = { id: '123', is_admin: false };

            requireAdmin(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Admin required' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if user is admin', () => {
            req.user = { id: '123', is_admin: true };

            requireAdmin(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});