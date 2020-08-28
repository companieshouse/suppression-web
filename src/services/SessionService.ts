import { SUPPRESSION_DATA_KEY, SuppressionData } from '../models/SuppressionDataModel';
import { Request } from 'express';

export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionData | undefined {

    const extraData: Record<any, any> = req.session!.extra_data;

    if (extraData) {
      return extraData[SUPPRESSION_DATA_KEY];
    }
    return undefined
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {

    if (!req.session!.extra_data) {
      req.session!.extra_data = {};
    }

    req.session!.extra_data = {SUPPRESSION_DATA_KEY: updatedSession};
  }
}
