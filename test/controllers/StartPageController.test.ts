import { OK } from 'http-status-codes';
import * as request from 'supertest';

import app from '../../src/app';
import { ROOT_URI } from '../../src/routes/paths';
import { Substitute } from '@fluffy-spoon/substitute';
import { Response } from 'express';

describe('StartPageController', () => {
  const response = Substitute.for<Response>()

    describe('on GET', () => {

        it('should return 200 and render the Service Start Page', async () => {
            const expectedPatterns = [
                /Apply to remove your home address from the Companies House register/,
                /Use this service to apply to remove your home address, or part of it, from the Companies House public register \(SR01\)\./,
                /<a.*>\s*Restricting the disclosure of your information\s*<\/a>/,
                /<a.* href="https:\/\/www.gov.uk\/government\/publications\/restricting-the-disclosure-of-your-psc-information">.*<\/a>/s,
                /<a.*>\s*Companies House register\s*<\/a>/,
                /<a.* href="https:\/\/beta.companieshouse.gov.uk\/">.*<\/a>/s,
            ];

            await request(app).get(ROOT_URI).expect(response => {
                expect(response.status).toEqual(OK);
                expectedPatterns.forEach((pattern) => {
                    expect(response.text).toMatch(pattern);
                })
            });
        });
    });
});
