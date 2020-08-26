import { Request } from 'express';
import { AnySchema } from 'joi';

import { SchemaValidator } from '../utils/validation/SchemaValidator';
import { ValidationResult } from '../utils/validation/ValidationResult';
import { Validator } from './Validator';

export class FormValidator implements Validator {
  constructor(private readonly formSchema: AnySchema) { }

  async validate(request: Request): Promise<ValidationResult> {
    return new SchemaValidator(this.formSchema).validate(request.body);
  }
}
