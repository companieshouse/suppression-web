import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { loggerInstance } from '../utils/Logger';

export function defaultHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  loggerInstance().error(`${err.constructor.name} - ${err.message}`);
  if (!err.statusCode) {
    err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
  res.status(err.statusCode).render('error');
}
