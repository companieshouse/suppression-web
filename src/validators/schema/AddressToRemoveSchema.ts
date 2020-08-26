import Joi from 'joi';

import { basicString } from './BasicStringSchemaItem'

export const schema = Joi.object({
  addressLine1: basicString('Building and street is required'),
  addressLine2: Joi.string().allow(null, ''),
  addressTown: basicString('Town or city is required'),
  addressCounty: basicString('County is required'),
  addressPostcode: basicString('Postcode is required')
});


