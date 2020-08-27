import { SuppressionSession } from '../models/suppressionSession.model';
import { Request } from 'express';

export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionSession | undefined {
    return req.session!.ExtraData
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionSession): void {
    req.session!.ExtraData = updatedSession
  }
}
