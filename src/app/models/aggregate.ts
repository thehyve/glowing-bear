export class Aggregate {
  private _min: number;
  private _max: number;
  private _average: number;
  private _values: string[];

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

  get average(): number {
    return this._average;
  }

  set average(value: number) {
    this._average = value;
  }

  get values(): string[] {
    return this._values;
  }

  set values(value: string[]) {
    this._values = value;
  }

}
