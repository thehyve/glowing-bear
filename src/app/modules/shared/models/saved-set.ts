export class SavedSet {

  private _id: string;
  private _name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

}
