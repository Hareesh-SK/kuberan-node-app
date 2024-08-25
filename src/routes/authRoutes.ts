import express from 'express';
import {AuthController} from '../controllers/authController';

const router = express.Router();
const authController = new AuthController();

router.post('/authenticate', (req, res) => authController.authenticate(req, res));
router.post('/saveUser', (req, res) => authController.saveUserDetails(req, res));
router.get('/user/:userId', (req, res, next) => authController.fetchUserData(req, res, next), (req, res) => {
  res.json({ success: true, userData: res.locals.userData });
});
router.post('/updateUser', (req, res) => authController.saveUserDetails(req, res));

export default router;
