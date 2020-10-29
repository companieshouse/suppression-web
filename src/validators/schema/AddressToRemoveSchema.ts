import Joi from 'joi';

import { basicString } from './BasicStringSchemaItem'

export const schema = Joi.object({
  line1: basicString('Enter the building and street'),
  line2: Joi.string().allow(null, ''),
  town: basicString('Enter the town or city'),
  county: basicString('Enter the county'),
  postcode: basicString('Enter the postcode'),
  country: basicString('Enter the country')
});
