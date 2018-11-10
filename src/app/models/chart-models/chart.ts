import {ChartType} from './chart-type';
import {GridsterItem} from 'angular-gridster2';
import {FormatHelper} from '../../utilities/format-helper';
import {Concept} from '../constraint-models/concept';

export class Chart {
  public readonly id: string;
  private _gridsterItem: GridsterItem;
  private _type: ChartType;
  private _variables: Concept[] = [];

  constructor(type: ChartType) {
    this.id = FormatHelper.generateId();
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

  get variables(): Concept[] {
    return this._variables;
  }

  set variables(value: Concept[]) {
    this._variables = value;
  }
}
