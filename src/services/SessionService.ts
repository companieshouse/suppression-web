import { SuppressionData } from '../models/SuppressionDataModel';
import { Request } from 'express';

export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionData | undefined {
    return req.session!.ExtraData
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {
    req.session!.ExtraData = updatedSession
  }
}
