import {QuerySetType} from './query-set-type';
import {QueryDiffItem} from './query-diff-item';

export class QueryDiffRecord {

  private _id: number;
  private _queryName: string;
  private _queryUsername: string;
  private _setId: number;
  private _setType: QuerySetType;
  private _createDate: string;
  private _diffItems: QueryDiffItem[];
  private _diffTypes: string[];
  private _partialRepresentation: object;
  private _completeRepresentation: object;
  private _countRepresentation: object;
  private _showCompleteRepresentation: boolean;

  constructor() {
    this.diffItems = [];
    this.showCompleteRepresentation = false;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get queryName(): string {
    return this._queryName;
  }

  set queryName(value: string) {
    this._queryName = value;
  }

  get queryUsername(): string {
    return this._queryUsername;
  }

  set queryUsername(value: string) {
    this._queryUsername = value;
  }

  get setId(): number {
    return this._setId;
  }

  set setId(value: number) {
    this._setId = value;
  }

  get setType(): QuerySetType {
    return this._setType;
  }

  set setType(value: QuerySetType) {
    this._setType = value;
  }

  get createDate(): string {
    return this._createDate;
  }

  set createDate(value: string) {
    this._createDate = value;
  }

  get diffItems(): QueryDiffItem[] {
    return this._diffItems;
  }

  set diffItems(value: QueryDiffItem[]) {
    this._diffItems = value;
    this.diffTypes = [];
    let map = {};
    this.partialRepresentation = {};
    this.completeRepresentation = {};
    this.countRepresentation = {};
    for (let item of this._diffItems) {
      const diffType = item.diffType;
      if (map.hasOwnProperty(diffType)) {
        map[diffType].push(item.objectId);
      } else {
        map[diffType] = [item.objectId];
      }
    }
    for (let key in map) {
      let partial = '';
      let complete = '';
      let count = 0;
      for (let id of map[key]) {
        complete += id + ', ';
        count++;
      }
      complete = complete.substring(0, complete.length - 2);
      const threshold = 2;
      if (count > threshold) {
        for (let i = 0; i < threshold; i++) {
          partial += map[key][i] + ', ';
        }
        partial = partial.substring(0, partial.length - 2) + '...';
      } else {
        partial = complete;
      }
      this.partialRepresentation[key] = partial;
      this.completeRepresentation[key] = complete;
      this.countRepresentation[key] = count;
      this.diffTypes.push(key);
    }
  }

  get partialRepresentation(): Object {
    return this._partialRepresentation;
  }

  set partialRepresentation(value: Object) {
    this._partialRepresentation = value;
  }

  get completeRepresentation(): Object {
    return this._completeRepresentation;
  }

  set completeRepresentation(value: Object) {
    this._completeRepresentation = value;
  }

  get showCompleteRepresentation(): boolean {
    return this._showCompleteRepresentation;
  }

  set showCompleteRepresentation(value: boolean) {
    this._showCompleteRepresentation = value;
  }

  get diffTypes(): string[] {
    return this._diffTypes;
  }

  set diffTypes(value: string[]) {
    this._diffTypes = value;
  }

  get countRepresentation(): Object {
    return this._countRepresentation;
  }

  set countRepresentation(value: Object) {
    this._countRepresentation = value;
  }
}
