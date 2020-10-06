import { SessionKey } from 'ch-node-session-handler/lib/session/keys/SessionKey'
import { ISignInInfo } from 'ch-node-session-handler/lib/session/model/SessionInterfaces';
import { Request } from 'express';
import {SuppressionData} from '../../models/SuppressionDataModel';
import { SuppressionSession, SUPPRESSION_DATA_KEY } from '../../models/suppressionSessionModel';

export default class SessionService {

  static getSession(req: Request): SuppressionSession | undefined {
    return req.session!.getExtraData<SuppressionSession>(SUPPRESSION_DATA_KEY);
  }

  static setSession(req: Request, updatedSession: SuppressionSession): void {
    req.session!.setExtraData(SUPPRESSION_DATA_KEY, updatedSession);
  }

  static getSuppressionSession(req: Request): SuppressionData | undefined {
    return req.session!.getExtraData<SuppressionData>(SUPPRESSION_DATA_KEY);
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {
    req.session!.setExtraData(SUPPRESSION_DATA_KEY, updatedSession);
  }

  static getAccessToken(req: Request): string {
    const signInInfo = req.session!.get<ISignInInfo>(SessionKey.SignInInfo)!;
    return signInInfo.access_token!.access_token!
  }

  static getUserEmail(req: Request): string {
    const signInInfo = req.session!.get<ISignInInfo>(SessionKey.SignInInfo)!;
    return signInInfo.user_profile!.email!
  }
}
