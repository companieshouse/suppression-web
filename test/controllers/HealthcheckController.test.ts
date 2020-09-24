import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { HEALTHCHECK_URI } from '../../src/routes/paths';
import { createApp } from '../ApplicationFactory';

describe('HealthcheckController', () => {

  const app = createApp();

  it('should return 200', async () => {
    await request(app)
      .get(HEALTHCHECK_URI)
      .expect(response => {
        expect(response.status).toEqual(StatusCodes.OK);
      });
  });
});
