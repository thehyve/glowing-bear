import {TransmartDimensionElement} from './transmart-dimension-element';

export class TransmartDimension {
  name: string;
  elements: Map<string, TransmartDimensionElement>;
}
