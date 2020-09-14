import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { ADDRESS_TO_REMOVE_PAGE_URI, APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../../src/routes/paths';
import { createApp } from '../ApplicationFactory';
import {
  expectToHaveBackButton,
  expectToHaveErrorMessages,
  expectToHaveErrorSummaryContaining,
  expectToHaveInput,
  expectToHaveTitle
} from '../HtmlPatternAssertions'

jest.mock('../../src/services/SessionService')

describe('ApplicantDetailsController', () => {

  const pageTitle = 'Applicant’s Details';
  const app = createApp();

  describe('on GET', () => {

    it('should return 200 and render the Applicant Details Page', async () => {

      await request(app).get(APPLICANT_DETAILS_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.OK);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveInput(response.text, 'fullName', 'Full name');
        expectToHaveInput(response.text, 'emailAddress', 'Email address');
      });
    });

  });

  describe('on POST', () => {

    const fullNameErrorMessage = 'Full name is required';
    const emailMissingErrorMessage = 'Email address is required';
    const emailInvalidErrorMessage = 'Enter an email address in the correct format, like name@example.com';

    it('should show two validation errors if no information is entered', async () => {

      await request(app).post(APPLICANT_DETAILS_PAGE_URI).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveErrorSummaryContaining(response.text, [fullNameErrorMessage, emailMissingErrorMessage]);
        expectToHaveErrorMessages(response.text, [fullNameErrorMessage, emailMissingErrorMessage]);
      });
    });

    it('should show a validation error if no name is entered', async () => {

      await request(app).post(APPLICANT_DETAILS_PAGE_URI).send({ emailAddress: 'test@example.com' }).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveErrorSummaryContaining(response.text, [fullNameErrorMessage]);
        expectToHaveErrorMessages(response.text, [fullNameErrorMessage]);
      });
    });

    it('should show a validation error if no email address is entered', async () => {

      await request(app).post(APPLICANT_DETAILS_PAGE_URI).send({ fullName: 'John Doe' }).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveErrorSummaryContaining(response.text, [emailMissingErrorMessage]);
        expectToHaveErrorMessages(response.text, [emailMissingErrorMessage]);
      });
    });

    it('should show a validation error if the email address entered is invalid', async () => {

      await request(app).post(APPLICANT_DETAILS_PAGE_URI).send({
        fullName: 'John Doe',
        emailAddress: 'test.com'
      }).expect(response => {
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expectToHaveTitle(response.text, pageTitle);
        expectToHaveBackButton(response.text, ROOT_URI);
        expectToHaveErrorSummaryContaining(response.text, [emailInvalidErrorMessage]);
        expectToHaveErrorMessages(response.text, [emailInvalidErrorMessage]);
      });
    });

    it('should redirect to the next page if the information provided by the user is valid', async () => {

      await request(app).post(APPLICANT_DETAILS_PAGE_URI).send({
        fullName: 'John Doe',
        emailAddress: 'test@example.com'
      }).expect(response => {
        expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
        expect(response.header.location).toContain(ADDRESS_TO_REMOVE_PAGE_URI);
      });
    });
  });
});
