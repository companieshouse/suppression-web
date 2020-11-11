import { Router } from 'express';

import { AccessibilityStatementController } from '../controllers/AccessibilityStatementController';
import { AddressToRemoveController } from '../controllers/AddressToRemoveController';
import { ApplicantDetailsController } from '../controllers/ApplicantDetailsController';
import { CheckSubmissionController } from '../controllers/CheckSubmissionController';
import { ConfirmationController } from '../controllers/ConfirmationController';
import { ContactDetailsController } from '../controllers/ContactDetailsController';
import { DocumentDetailsController } from '../controllers/DocumentDetailsController';
import { HealthcheckController } from '../controllers/HealthcheckController';
import { PaymentCallbackController } from '../controllers/PaymentCallbackController';
import { PaymentReviewController } from '../controllers/PaymentReviewController';
import { ServiceAddressController } from '../controllers/ServiceAddressController';
import { StartPageController } from '../controllers/StartPageController';
import { getConfigValue } from '../modules/config-handler/ConfigHandler';
import { PaymentService } from '../services/payment/PaymentService';
import { RefreshTokenService } from '../services/refresh-token/RefreshTokenService';
import { SuppressionService } from '../services/suppression/SuppressionService';
import {
  ACCESSIBILITY_STATEMENT_URI,
  ADDRESS_TO_REMOVE_PAGE_URI,
  APPLICANT_DETAILS_PAGE_URI,
  CHECK_SUBMISSION_PAGE_URI,
  CONFIRMATION_PAGE_URI,
  CONTACT_DETAILS_PAGE_URI,
  DOCUMENT_DETAILS_PAGE_URI,
  HEALTHCHECK_URI,
  PAYMENT_CALLBACK_URI,
  PAYMENT_REVIEW_PAGE_URI,
  ROOT_URI,
  SERVICE_ADDRESS_PAGE_URI
} from './paths';

export const routes = Router();

/**
 * Services
 */
const refreshTokenService: RefreshTokenService = new RefreshTokenService(getConfigValue(`OAUTH2_TOKEN_URI`)!,
  getConfigValue(`OAUTH2_CLIENT_ID`)!, getConfigValue(`OAUTH2_CLIENT_SECRET`)!);
const suppressionService: SuppressionService = new SuppressionService(getConfigValue('SUPPRESSIONS_API_URL') as string, refreshTokenService);
const paymentService: PaymentService = new PaymentService(refreshTokenService);

/**
 * Controllers (route handlers).
 */
const startPageController = new StartPageController();
const applicantDetailsController = new ApplicantDetailsController(suppressionService);
const addressToRemoveController = new AddressToRemoveController(suppressionService);
const documentDetailsController = new DocumentDetailsController(suppressionService);
const serviceAddressController = new ServiceAddressController(suppressionService);
const contactDetailsController = new ContactDetailsController(suppressionService);
const checkSubmissionController = new CheckSubmissionController(suppressionService);
const paymentReviewController = new PaymentReviewController(suppressionService, paymentService);
const paymentCallbackController = new PaymentCallbackController(suppressionService, paymentService);
const confirmationController = new ConfirmationController(suppressionService);
const accessibilityStatementController = new AccessibilityStatementController();

const healthcheckController = new HealthcheckController();

/**
 * Route definitions
 */
routes.get(ROOT_URI, startPageController.renderView);
routes.post(ROOT_URI, startPageController.start);

routes.get(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.renderView);
routes.post(APPLICANT_DETAILS_PAGE_URI, applicantDetailsController.processForm);

routes.get(ADDRESS_TO_REMOVE_PAGE_URI, addressToRemoveController.renderView);
routes.post(ADDRESS_TO_REMOVE_PAGE_URI, addressToRemoveController.processForm);

routes.get(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.renderView);
routes.post(DOCUMENT_DETAILS_PAGE_URI, documentDetailsController.processForm);

routes.get(SERVICE_ADDRESS_PAGE_URI, serviceAddressController.renderView);
routes.post(SERVICE_ADDRESS_PAGE_URI, serviceAddressController.processForm);

routes.get(CONTACT_DETAILS_PAGE_URI, contactDetailsController.renderView);
routes.post(CONTACT_DETAILS_PAGE_URI, contactDetailsController.processForm);

routes.get(CHECK_SUBMISSION_PAGE_URI, checkSubmissionController.renderView);
routes.post(CHECK_SUBMISSION_PAGE_URI, checkSubmissionController.confirm);

routes.get(PAYMENT_REVIEW_PAGE_URI, paymentReviewController.renderView);
routes.post(PAYMENT_REVIEW_PAGE_URI, paymentReviewController.continue);

routes.get(PAYMENT_CALLBACK_URI, paymentCallbackController.checkPaymentStatus);

routes.get(CONFIRMATION_PAGE_URI, confirmationController.renderView);

routes.get(ACCESSIBILITY_STATEMENT_URI, accessibilityStatementController.renderView);

routes.get(HEALTHCHECK_URI, healthcheckController.healthcheck);
