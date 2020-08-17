import { Router } from 'express';
import { StartPageController } from '../controllers/StartPageController';
import { ROOT_URI } from './paths';


export const routes = Router();

/**
 * Controllers (route handlers).
 */
const homeController = new StartPageController();

/**
 * Route definitions
 */
routes.get(ROOT_URI, homeController.renderView);
