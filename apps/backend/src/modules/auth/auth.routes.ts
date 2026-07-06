import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.dto';
import { registerHandler, loginHandler } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), registerHandler);
authRouter.post('/login', validate({ body: loginSchema }), loginHandler);
