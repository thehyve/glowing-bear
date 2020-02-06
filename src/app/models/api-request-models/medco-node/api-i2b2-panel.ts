import {ApiI2b2Item} from './api-i2b2-item';

export class ApiI2b2Panel {
  not: boolean;
  items: ApiI2b2Item[];

  constructor() {
    this.items = [];
  }
}
