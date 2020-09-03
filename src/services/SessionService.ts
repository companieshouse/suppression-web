import { Request } from 'express';
import { SuppressionData, SUPPRESSION_DATA_KEY } from '../models/SuppressionDataModel';


export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionData | undefined {

    const extraData: Record<any, any> = req.session!.extra_data;

    if (extraData) {
      return extraData[SUPPRESSION_DATA_KEY];
    }
    return undefined
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {

    if (req.session!.extra_data === undefined) {
      req.session!.extra_data = {};
    }

    req.session!.extra_data[SUPPRESSION_DATA_KEY] =  updatedSession;
  }
}
