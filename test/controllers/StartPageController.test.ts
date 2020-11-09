import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { APPLICANT_DETAILS_PAGE_URI, ROOT_URI } from '../../src/routes/paths';
import { createApp } from '../ApplicationFactory';
import { expectToHaveLink, expectToHaveTitle } from '../HtmlPatternAssertions'

describe('StartPageController', () => {

  const app = createApp();

  describe('on GET', () => {

    it('should return 200 and render the Service Start Page', async () => {
      const expectedTitle = 'Apply to remove your home address from the Companies House register';

      await request(app)
        .get(ROOT_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, expectedTitle);
          expectToHaveLink(response.text,
            'https:\/\/www.gov.uk\/government\/publications\/apply-to-remove-your-home-address-from-the-public-register-sr01',
            'complete a paper application \\(SR01\\)');
          expectToHaveLink(response.text,
            'https:\/\/www.gov.uk\/government\/publications\/restricting-the-disclosure-of-your-psc-information',
            'Restricting the disclosure of your information');
          expectToHaveLink(response.text,
            'https:\/\/beta.companieshouse.gov.uk\/',
            'Companies House register');
          expectToHaveLink(response.text,
            '\/suppress-my-details\/accessibility-statement',
            'Accessibility statement');
        });
    });
  });

  describe('on POST', () => {

    it('should return status code 302 and redirect to applicant details page', async () => {

      await request(app)
        .post(ROOT_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.header.location).toEqual(APPLICANT_DETAILS_PAGE_URI)
        });
    });
  });
});
