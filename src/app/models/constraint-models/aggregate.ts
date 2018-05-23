import {AggregateType} from './aggregate-type';

export class Aggregate {
  private _type: AggregateType;

  get type(): AggregateType {
    return this._type;
  }

  set type(value: AggregateType) {
    this._type = value;
  }
}
