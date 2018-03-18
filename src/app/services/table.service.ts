import {Injectable} from '@angular/core';
import {Dimension} from '../models/dimension';

@Injectable()
export class TableService {

  private _dimensions: Dimension[];

  constructor() {
  }

  public generateTableDimensions(): Dimension[] {
    this.dimensions = [];
    this.dimensions.push(new Dimension('d1'));
    this.dimensions.push(new Dimension('d2'));
    this.dimensions.push(new Dimension('d3'));
    return this.dimensions;
  }

  get dimensions(): Dimension[] {
    return this._dimensions;
  }

  set dimensions(value: Dimension[]) {
    this._dimensions = value;
  }
}
