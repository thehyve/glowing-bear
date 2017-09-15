export class SavedSet {

  private _id: string;
  private _name: string;
  // Indicate if the set is bookmarked
  private _bookmarked: boolean;
  // Indicate if the set is collapsed
  private _collapsed: boolean;
  // Indicate if the set name is being edited
  private _nameEditable: boolean;
  // Indicate if the set is selected, in other words, being edited
  private _selected: boolean;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.collapsed = false;
    this.bookmarked = false;
    this.nameEditable = false;
    this.selected = false;
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

  get bookmarked(): boolean {
    return this._bookmarked;
  }

  set bookmarked(value: boolean) {
    this._bookmarked = value;
  }

  get collapsed(): boolean {
    return this._collapsed;
  }

  set collapsed(value: boolean) {
    this._collapsed = value;
  }

  get nameEditable(): boolean {
    return this._nameEditable;
  }

  set nameEditable(value: boolean) {
    this._nameEditable = value;
  }

  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
  }
}
