import Joi from 'joi';

import { basicString } from './BasicStringSchemaItem'

export const schema = Joi.object({
  line1: basicString('Building and street is required'),
  line2: Joi.string().allow(null, ''),
  town: basicString('Town or city is required'),
  county: basicString('County is required'),
  postcode: basicString('Postcode is required')
});
