import {PicsureResource} from '../../models/picsure-models/resource-definition/picsure-resource';

// todo
export class PicSureResourceServiceMock {

  private _currentResource: PicsureResource;
  private _resources: PicsureResource[];

  constructor() {
    this.resources = [];
    this.currentResource = new PicsureResource();
  }
  get resources(): PicsureResource[] {
    return this._resources;
  }

  get currentResource(): PicsureResource {
    return this._currentResource;
  }

  set currentResource(value: PicsureResource) {
    this._currentResource = value;
  }

  set resources(value: PicsureResource[]) {
    this._resources = value;
  }
}
