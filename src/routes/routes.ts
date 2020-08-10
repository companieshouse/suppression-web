import { Router } from 'express';
import { HomeController } from '../controllers/HomeController';


export const routes = Router();

/**
 * Controllers (route handlers).
 */
const homeController = new HomeController();

/**
 * Route definitions
 */
routes.get('/', homeController.sayHello);
