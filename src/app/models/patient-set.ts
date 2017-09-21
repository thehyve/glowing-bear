import {SavedSet} from "./saved-set";

export class PatientSet extends SavedSet{
  private _description: string;
  private _setSize: number;
  private _status: string;
  private _username: string;
  private _requestConstraints: string;

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get setSize(): number {
    return this._setSize;
  }

  set setSize(value: number) {
    this._setSize = value;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  get requestConstraints(): string {
    return this._requestConstraints;
  }

  set requestConstraints(value: string) {
    this._requestConstraints = value;
  }

}
