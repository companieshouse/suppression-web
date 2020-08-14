
import { OK } from 'http-status-codes';
import * as request from 'supertest';

import app from '../../src/app';
import { ROOT_URI } from '../../src/routes/paths';

describe('HomeController', () => {

    describe('on GET', () => {

        it('should return 200', async () => {
            await request(app).get(ROOT_URI).expect(response => {
                expect(response.status).toEqual(OK);
                expect(response.text).toContain('Hello World');
            });
        });
    });
});