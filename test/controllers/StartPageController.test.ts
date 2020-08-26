import { OK } from 'http-status-codes';
import * as request from 'supertest';

import app from '../../src/app';
import { ROOT_URI } from '../../src/routes/paths';
import { expectToHaveLink, expectToHaveTitle } from '../HtmlPatternAssertions'

describe('StartPageController', () => {

  describe('on GET', () => {

    it('should return 200 and render the Service Start Page', async () => {
      const expectedTitle = 'Apply to remove your home address from the Companies House register';

      await request(app).get(ROOT_URI).expect(response => {
        expect(response.status).toEqual(OK);
        expectToHaveTitle(response.text, expectedTitle)
        expectToHaveLink(response.text,
          'https:\/\/www.gov.uk\/government\/publications\/restricting-the-disclosure-of-your-psc-information',
          'Restricting the disclosure of your information');
        expectToHaveLink(response.text,
          'https:\/\/beta.companieshouse.gov.uk\/',
          'Companies House register');
      });
    });
  });
});
