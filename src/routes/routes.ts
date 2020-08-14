import { Router } from 'express';
import { HomeController } from '../controllers/HomeController';
import { ROOT_URI } from './paths';


export const routes = Router();

/**
 * Controllers (route handlers).
 */
const homeController = new HomeController();

/**
 * Route definitions
 */
routes.get(ROOT_URI, homeController.sayHello);
