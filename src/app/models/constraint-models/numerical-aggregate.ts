import {Aggregate} from './aggregate';

export class NumericalAggregate extends Aggregate {
  private _min: number;
  private _max: number;
  private _avg: number;
  private _stdDev: number;
  private _count: number;

  get min(): number {
    return this._min;
  }

  set min(value: number) {
    this._min = value;
  }

  get max(): number {
    return this._max;
  }

  set max(value: number) {
    this._max = value;
  }

  get avg(): number {
    return this._avg;
  }

  set avg(value: number) {
    this._avg = value;
  }

  get stdDev(): number {
    return this._stdDev;
  }

  set stdDev(value: number) {
    this._stdDev = value;
  }

  get count(): number {
    return this._count;
  }

  set count(value: number) {
    this._count = value;
  }
}
