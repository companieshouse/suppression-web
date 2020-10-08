import { Request } from 'express';
import { SuppressionData } from '../../../models/SuppressionDataModel';
import { SuppressionSession } from '../../../models/suppressionSessionModel';

export default class SessionService {

  static getSession(req: Request): SuppressionSession | undefined {
    return {
      applicationReference: '12345'
    } as SuppressionSession
  }

  static setSession(req: Request): void {
    return;
  }

  static getSuppressionSession(req: Request): SuppressionData | undefined {
    return {
      addressToRemove: {
        line1: '1 Test Street',
        line2: '',
        town: 'Test Town',
        county: 'Test Midlands',
        postcode: 'TE10 6ST',
        country: 'United Kingdom'
      }
    } as SuppressionData;
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {
    return;
  }

  static getAccessToken(req: Request): string {
    return 'mock-token';
  }

  static getUserEmail(req: Request): string {
    return 'ch-test@example.com';
  }
}
