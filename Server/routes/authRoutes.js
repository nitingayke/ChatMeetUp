import { Router } from 'express';
import wrapAsync from '../utils/wrapAsync.js';
import { getLoginUserData, userLogin, userRegister } from '../controllers/authController.js';

const router = Router();

router.post('/login', wrapAsync(userLogin));

router.post('/register', wrapAsync(userRegister));

router.post('/get-login-user', wrapAsync(getLoginUserData));

export default router;

