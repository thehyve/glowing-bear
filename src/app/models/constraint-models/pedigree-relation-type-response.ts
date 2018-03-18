export class PedigreeRelationTypeResponse {
  private _label: string;
  private _description: string;
  private _biological: boolean;
  private _symmetrical: boolean;

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get biological(): boolean {
    return this._biological;
  }

  set biological(value: boolean) {
    this._biological = value;
  }

  get symmetrical(): boolean {
    return this._symmetrical;
  }

  set symmetrical(value: boolean) {
    this._symmetrical = value;
  }
}
