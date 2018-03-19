export class TrialVisit {
  private _id: string;
  private _relTimeLabel: string;
  private _relTimeunit: string;
  private _relTime: number;

  constructor(id?: string) {
    this.id = id ? id : '';
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get relTimeLabel(): string {
    return this._relTimeLabel;
  }

  set relTimeLabel(value: string) {
    this._relTimeLabel = value;
  }

  get relTimeunit(): string {
    return this._relTimeunit;
  }

  set relTimeunit(value: string) {
    this._relTimeunit = value;
  }

  get relTime(): number {
    return this._relTime;
  }

  set relTime(value: number) {
    this._relTime = value;
  }
}
