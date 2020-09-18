import { Request } from 'express';
import { SuppressionData } from '../../../models/SuppressionDataModel';

export default class SessionService {
  static getSuppressionSession(req: Request): SuppressionData | undefined {
    return {
      applicantDetails: {
        fullName: 'John Doe',
        emailAddress: 'test@example.com'
      },
      addressToRemove: {
        line1: '1 Test Street',
        line2: '',
        town: 'Test Town',
        county: 'Test Midlands',
        postcode: 'TE10 6ST',
        country: 'United Kingdom'
      }
    } as SuppressionData
  }

  static setSuppressionSession(req: Request, updatedSession: SuppressionData): void {
    return;
  }

  static getAccessToken(req: Request): string {
    return 'mock-token';
  }
}
