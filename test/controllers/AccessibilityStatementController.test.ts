import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { ACCESSIBILITY_STATEMENT_URI } from '../../src/routes/paths';
import { createApp } from '../ApplicationFactory';
import { expectToHaveTitle } from '../HtmlPatternAssertions'

describe('AccessibilityStatementController', () => {

  const app = createApp();

  describe('on GET', () => {

    it('should return 200 and render the Accessibility Statement', async () => {
      const expectedTitle = 'Accessibility statement for the Apply to remove your home address from the Companies House register service';

      await request(app)
        .get(ACCESSIBILITY_STATEMENT_URI)
        .expect(response => {
          expect(response.status).toEqual(StatusCodes.OK);
          expectToHaveTitle(response.text, expectedTitle);
        });
    });
  });
});
