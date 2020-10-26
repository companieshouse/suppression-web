import { Request } from 'express';
import { SuppressionSession } from '../../../models/SuppressionSessionModel';

export default class SessionService {

  static getSuppressionSession(req: Request): SuppressionSession | undefined {
    return {
      applicationReference: '12345-12345'
    } as SuppressionSession
  }

  static setSuppressionSession(req: Request): void {
    return;
  }

  static getNavigationPermissions(req: Request): string [] {
    return [];
  }

  static setNavigationPermission(req: Request, permissionList: string []): void {
    return;
  }

  static getAccessToken(req: Request): string {
    return 'mock-token';
  }

  static getUserEmail(req: Request): string {
    return 'ch-test@example.com';
  }
}
