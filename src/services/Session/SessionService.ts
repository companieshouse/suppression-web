import { Request } from 'express';
import { SuppressionData, SUPPRESSION_DATA_KEY } from '../../models/SuppressionDataModel';


export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionData | undefined {
    return req.session!.data.extra_data[SUPPRESSION_DATA_KEY];
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {
    req.session!.data.extra_data[SUPPRESSION_DATA_KEY] = updatedSession;
  }
}
