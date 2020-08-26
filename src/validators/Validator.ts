import { Request } from 'express';

import { ValidationResult } from '../utils/validation/ValidationResult';

export interface Validator {
  validate(request: Request): Promise<ValidationResult>;
}
