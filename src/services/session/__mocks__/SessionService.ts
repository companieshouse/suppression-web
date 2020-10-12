import { Request } from 'express';
import { SuppressionData } from '../../../models/SuppressionDataModel';
import { SuppressionSession } from '../../../models/suppressionSessionModel';

export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionSession | undefined {
    return {
      applicationReference: '12345'
    } as SuppressionSession
  }

  static setSuppressionSession(req: Request): void {
    return;
  }

  static getAccessToken(req: Request): string {
    return 'mock-token';
  }

  static getUserEmail(req: Request): string {
    return 'ch-test@example.com';
  }
}
