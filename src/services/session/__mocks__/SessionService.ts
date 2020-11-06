import { Request } from 'express';
import { SuppressionSession } from '../../../models/SuppressionSessionModel';

export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionSession | undefined {
    return {
      applicationReference: '12345-12345',
      navigationPermissions: []
    } as SuppressionSession
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionSession): void {
    return;
  }

  static resetSuppressionSession(req: Request): void {
    return;
  }

  static appendNavigationPermissions(req: Request, permissions: string): void {
    return;
  }

  static getAccessToken(req: Request): string {
    return 'mock-token';
  }

  static getRefreshToken(req: Request): string {
    return 'mock-refresh-token';
  }

  static getUserEmail(req: Request): string {
    return 'ch-test@example.com';
  }
}
