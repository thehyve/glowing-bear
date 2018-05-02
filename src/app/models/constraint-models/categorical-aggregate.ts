import {Aggregate} from './aggregate';

export class CategoricalAggregate extends Aggregate {
  private _valueCounts: Map<string, number>;

  constructor() {
    super();
    this.valueCounts = new Map<string, number>();
  }
  get values(): Array<string> {
    return Array.from(this.valueCounts.keys());
  }

  get valueCounts(): Map<string, number> {
    return this._valueCounts;
  }

  set valueCounts(value: Map<string, number>) {
    this._valueCounts = value;
  }
}
