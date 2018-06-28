export class CountItem {
  private _subjectCount: number;
  private _observationCount: number;

  constructor(subjectCount: number, observationCount: number) {
    this.subjectCount = subjectCount;
    this.observationCount = observationCount;
  }

  get subjectCount(): number {
    return this._subjectCount;
  }

  set subjectCount(value: number) {
    this._subjectCount = value;
  }

  get observationCount(): number {
    return this._observationCount;
  }

  set observationCount(value: number) {
    this._observationCount = value;
  }
}
