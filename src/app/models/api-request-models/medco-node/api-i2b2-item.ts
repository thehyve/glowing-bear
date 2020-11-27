import { ApiI2B2Modifier } from './api-i2b2-modifier';

export class ApiI2b2Item {
  queryTerm: string;
  operator: string;
  value?: string;
  modifier?: ApiI2B2Modifier;
  encrypted: boolean;
}
