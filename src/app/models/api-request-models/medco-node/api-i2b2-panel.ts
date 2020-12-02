import {ApiI2b2Item} from './api-i2b2-item';
import { ApiI2b2Timing } from './api-i2b2-timing';

export class ApiI2b2Panel {
  not: boolean;
  items: ApiI2b2Item[];
  panelTiming: ApiI2b2Timing

  constructor() {
    this.items = [];
  }
}
