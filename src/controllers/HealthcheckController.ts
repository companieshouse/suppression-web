import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class HealthcheckController {

  public healthcheck = (_: any, res: Response, __: any) => {
    res.status(StatusCodes.OK).send({ 'status': 'OK'});
  };
}
