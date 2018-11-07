import {ChartType} from './chart-type';

export class Chart {
  private _type: ChartType;

  constructor(type: ChartType) {
    this.type = type;
  }

  get type(): ChartType {
    return this._type;
  }

  set type(value: ChartType) {
    this._type = value;
  }
}
