import { Router } from 'express';
import { DocumentDetailsController } from '../controllers/DocumentDetailsController';
import { StartPageController } from '../controllers/StartPageController';
import { DOCUMENT_DETAILS_PAGE_URI, ROOT_URI } from './paths';


export const routes = Router();

/**
 * Controllers (route handlers).
 */
const startPageController = new StartPageController();
const documentDetailsController = new DocumentDetailsController();

/**
 * Route definitions
 */
routes.get(ROOT_URI, startPageController.renderView);

routes.get(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.renderView);
