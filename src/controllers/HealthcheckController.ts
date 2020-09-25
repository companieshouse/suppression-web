import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class HealthcheckController {

  public healthcheck = (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).send({ 'status': 'OK'});
  };
}
