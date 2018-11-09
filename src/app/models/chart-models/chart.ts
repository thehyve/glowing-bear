import {ChartType} from './chart-type';
import {GridsterItem} from 'angular-gridster2';

export class Chart {
  private _gridsterItem: GridsterItem;
  private _type: ChartType;

  constructor(type: ChartType) {
    this.type = type;
    const cols = type === ChartType.CROSSTABLE ? 3 : 1;
    const rows = 1;
    const dragEnabled = type === ChartType.CROSSTABLE ? false : true;
    this.gridsterItem = {
      x: 0,
      y: 0,
      cols: cols,
      rows: rows,
      dragEnabled: dragEnabled
    }
  }

  get type(): ChartType {
    return this._type;
  }

  set type(value: ChartType) {
    this._type = value;
  }

  get gridsterItem(): GridsterItem {
    return this._gridsterItem;
  }

  set gridsterItem(value: GridsterItem) {
    this._gridsterItem = value;
  }
}
