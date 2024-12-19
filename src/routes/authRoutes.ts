import express from 'express';
import {AuthController} from '../controllers/authController';
import {PlannerController} from '../controllers/plannerController';
import {UserController} from '../controllers/userController';
import { ReportController } from '../controllers/reportController';


const router = express.Router();
const authController = new AuthController();
const plannerController = new PlannerController();
const userController = new UserController();
const reportController = new ReportController();

router.post('/authenticate', (req, res) => authController.authenticate(req, res));
router.post('/saveUser', (req, res) => userController.saveUserDetails(req, res));
router.get('/user/:userId', (req, res, next) => userController.fetchUserData(req, res, next), (req, res) => {
  res.json({ success: true, userData: res.locals.userData });
});
router.post('/updateUser', (req, res) => userController.updateUserDetails(req, res));
router.post('/saveMonthPlan/:userId', (req, res) => plannerController.saveMonthPlan(req, res));
router.post('/getReport/:userId',(req, res) => reportController.getReport(req, res))

export default router;
