import {TransmartDimensionElement} from './transmart-dimension-element';

export class TransmartDimension {
  name: string;
  elements: Array<TransmartDimensionElement>;
  indexes?: Array<number>;
}
