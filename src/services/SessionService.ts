import { Request } from 'express';
import { SuppressionData, SUPPRESSION_DATA_KEY } from '../models/SuppressionDataModel';


export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionData {
    return req.session!.getExtraData(SUPPRESSION_DATA_KEY) || {} as SuppressionData;
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {
    req.session!.setExtraData(SUPPRESSION_DATA_KEY, updatedSession);
  }
}
