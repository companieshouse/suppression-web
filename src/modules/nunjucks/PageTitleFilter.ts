import { ValidationResult } from '../../utils/validation/ValidationResult';

export function pageTitleFilter(title: string, validationResult: ValidationResult | undefined ): string {

  const errPrefix: string = ( validationResult && validationResult.errors.length > 0 ) ? 'Error: ' : '';
  return `${errPrefix}${title}`;

}
