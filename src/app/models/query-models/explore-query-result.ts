import {ApiNodeMetadata} from '../api-response-models/medco-network/api-node-metadata';

export class ExploreQueryResult {
  private _nodes: ApiNodeMetadata[]
  private _globalCount: number;
  private _perSiteCounts?: number[];
  patientLists?: number[][];
  private _resultInstanceID?: number[];

  get nodes(): ApiNodeMetadata[] {
    return this._nodes;
  }

  set nodes(node: ApiNodeMetadata[]) {
    this._nodes = node;
  }

  get globalCount(): number {
    return this._globalCount < 0 ? 0 : this._globalCount;
  }

  set globalCount(value: number) {
    this._globalCount = value;
  }

  get perSiteCounts(): number[] {
    return this._perSiteCounts.map((perSiteCount: number) =>
      perSiteCount < 0 ? 0 : perSiteCount
    );
  }

  set perSiteCounts(value: number[]) {
    this._perSiteCounts = value;
  }

  set resultInstanceID(value: number[]) {
    this._resultInstanceID = value
  }

  get resultInstanceID(): number[] {
    return this._resultInstanceID
  }
}
