import { Request } from 'express';
import { AnySchema } from 'joi';

import { SchemaValidator } from './utils/SchemaValidator';
import { ValidationResult } from './utils/ValidationResult';
import { Validator } from './Validator';

export class FormValidator implements Validator {
  constructor(private readonly formSchema: AnySchema) { }

  async validate(request: Request): Promise<ValidationResult> {
    return new SchemaValidator(this.formSchema).validate(request.body);
  }
}
