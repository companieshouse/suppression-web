import { Request } from 'express';

import { ValidationResult } from './utils/ValidationResult';

export interface Validator {
  validate(request: Request): Promise<ValidationResult>;
}
