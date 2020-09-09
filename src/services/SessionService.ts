import { SessionKey } from 'ch-node-session-handler/lib/session/keys/SessionKey'
import { ISignInInfo } from 'ch-node-session-handler/lib/session/model/SessionInterfaces';
import { Request } from 'express';

import { SuppressionData, SUPPRESSION_DATA_KEY } from '../models/SuppressionDataModel';

export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionData | undefined {
    return req.session!.getExtraData<SuppressionData>(SUPPRESSION_DATA_KEY);
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {
    req.session!.setExtraData(SUPPRESSION_DATA_KEY, updatedSession);
  }

  static getAccessToken(req: Request): string {
    const signInInfo = req.session!.get<ISignInInfo>(SessionKey.SignInInfo)!
    return signInInfo!.access_token!.access_token!
  }
}
