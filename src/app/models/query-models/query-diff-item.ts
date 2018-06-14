import {QueryDiffType} from './query-diff-type';

export class QueryDiffItem {
  private _id: number;
  private _diffType: QueryDiffType;
  private _objectId: number;


  get diffType(): QueryDiffType {
    return this._diffType;
  }

  set diffType(value: QueryDiffType) {
    this._diffType = value;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get objectId(): number {
    return this._objectId;
  }

  set objectId(value: number) {
    this._objectId = value;
  }
}
