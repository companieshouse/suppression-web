import { SessionKey } from '@companieshouse/node-session-handler/lib/session/keys/SessionKey';
import { ISignInInfo } from '@companieshouse/node-session-handler/lib/session/model/SessionInterfaces';
import { Request } from 'express';
import { SuppressionSession, SUPPRESSION_DATA_KEY } from '../../models/SuppressionSessionModel';

export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionSession | undefined {
    return req.session!.getExtraData<SuppressionSession>(SUPPRESSION_DATA_KEY);
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionSession): void {
    req.session!.setExtraData(SUPPRESSION_DATA_KEY, updatedSession);
  }

  static getNavigationPermissions(req: Request): string[] | undefined {
    const session: SuppressionSession | undefined = this.getSuppressionSession(req);
    return session?.navigationPermissions;
  }

  static setNavigationPermission(req: Request, permissionList: string []): void {
    const session: SuppressionSession = this.getSuppressionSession(req)!;
    session.navigationPermissions = permissionList;
    this.setSuppressionSession(req, session!)
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
