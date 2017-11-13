export class Query {

  private _id: string;
  private _name: string;
  private _description: string;
  private _createDate: string;
  private _updateDate: string;
  private _apiVersion: string;
  // Indicate if the set is bookmarked
  private _bookmarked: boolean;
  // Indicate if the set is collapsed
  private _collapsed: boolean;
  // Indicate if the set name is being edited
  private _nameEditable: boolean;
  // Indicate if the set is selected, in other words, being edited
  private _selected: boolean;
  // The patient constraint part of the query
  private _patientsQuery: object;
  // The observation constraint part of the query
  private _observationsQuery: object;
  // The visual indicator flags the visibility of the query
  private _visible: boolean;

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

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
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

  get patientsQuery(): Object {
    return this._patientsQuery;
  }

  set patientsQuery(value: Object) {
    this._patientsQuery = value;
  }

  get observationsQuery(): Object {
    return this._observationsQuery;
  }

  set observationsQuery(value: Object) {
    this._observationsQuery = value;
  }

  get createDate(): string {
    return this._createDate;
  }

  set createDate(value: string) {
    this._createDate = value;
  }

  get updateDate(): string {
    return this._updateDate;
  }

  set updateDate(value: string) {
    this._updateDate = value;
  }

  get apiVersion(): string {
    return this._apiVersion;
  }

  set apiVersion(value: string) {
    this._apiVersion = value;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
  }
}
