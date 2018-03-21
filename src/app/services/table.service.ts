import {Injectable} from '@angular/core';
import {Dimension} from '../models/table-models/dimension';
import {DataTable} from '../models/table-models/data-table';
import {Row} from '../models/table-models/row';
import {ResourceService} from "./resource.service";

@Injectable()
export class TableService {

  private _dataTable: DataTable;

  constructor(private resourceService: ResourceService) {
    this.dataTable = new DataTable();
    this.mockData();
  }

  mockData() {
    // dimensions
    let subjectDim = new Dimension('Subject');
    subjectDim.valueNames.push('s1');
    subjectDim.valueNames.push('s5');
    subjectDim.valueNames.push('s2');
    subjectDim.valueNames.push('s6');
    subjectDim.valueNames.push('s3');
    subjectDim.valueNames.push('s7');
    subjectDim.valueNames.push('s4');
    subjectDim.valueNames.push('s8');
    let conceptDim = new Dimension('Concept');
    conceptDim.valueNames.push('Age');
    conceptDim.valueNames.push('Gender');
    let studyDim = new Dimension('Study');
    studyDim.valueNames.push('Study-A');
    studyDim.valueNames.push('Study-B');
    let visitDim = new Dimension('Visit');
    visitDim.valueNames.push('Visit-1');
    visitDim.valueNames.push('Visit-2');
    visitDim.valueNames.push('Visit-3');

    this.rowDimensions.push(subjectDim);
    this.rowDimensions.push(studyDim);
    this.columnDimensions.push(conceptDim);
    this.columnDimensions.push(visitDim);

    // generate the column-header rows
    let numColDimColumns = this.columnDimensions.length > 0 ? 1 : 0;
    for (let colIndex = 0; colIndex < this.columnDimensions.length; colIndex++) {
      let colDim = this.columnDimensions[colIndex];
      numColDimColumns = numColDimColumns * colDim.valueNames.length;
      let row = new Row();

      // add empty space fillers on the top-left corner of the table
      for (let rowIndex = 0; rowIndex < this.rowDimensions.length; rowIndex++) {
        row.addDatum('');
      }

      // add the column header names
      let dimensionsAbove = this.getDimensionsAbove(colDim, this.columnDimensions);
      let selfRepetition = 1;
      for (let dimAbove of dimensionsAbove) {
        selfRepetition = selfRepetition * dimAbove.valueNames.length;
      }
      let dimensionsBelow = this.getDimensionsBelow(colDim, this.columnDimensions);
      let valueRepetition = 1;
      for (let dimBelow of dimensionsBelow) {
        valueRepetition = valueRepetition * dimBelow.valueNames.length;
      }

      for (let i = 0; i < selfRepetition; i++) {
        for (let valName of colDim.valueNames) {
          for (let j = 0; j < valueRepetition; j++) {
            row.addDatum(valName);
          }
        }
      }
      this.rows.push(row);
    }
    // generate the data rows
    let dataRows = [];
    let rowDim0 = this.rowDimensions[0];
    let dimensionsRight0 = this.getDimensionsBelow(rowDim0, this.rowDimensions);
    let valueRepetition0 = 1;
    for (let dimRight of dimensionsRight0) {
      valueRepetition0 = valueRepetition0 * dimRight.valueNames.length;
    }
    for (let valName of rowDim0.valueNames) {
      for (let j = 0; j < valueRepetition0; j++) {
        let row = new Row();
        row.addDatum(valName);
        dataRows.push(row);
      }
    }
    let index = 0;
    for (let rowIndex = 1; rowIndex < this.rowDimensions.length; rowIndex++) {
      let rowDim = this.rowDimensions[rowIndex];
      let dimensionsLeft = this.getDimensionsAbove(rowDim, this.rowDimensions);
      let selfRepetition = 1;
      for (let dimLeft of dimensionsLeft) {
        selfRepetition = selfRepetition * dimLeft.valueNames.length;
      }
      let dimensionsRight = this.getDimensionsBelow(rowDim, this.rowDimensions);
      let valueRepetition = 1;
      for (let dimRight of dimensionsRight) {
        valueRepetition = valueRepetition * dimRight.valueNames.length;
      }
      for (let i = 0; i < selfRepetition; i++) {
        for (let valName of rowDim.valueNames) {
          for (let j = 0; j < valueRepetition; j++) {
            dataRows[index].addDatum(valName);
            index++;
          }
        }
      }
    }
    for (let dataRow of dataRows) {
      for (let i = 0; i < numColDimColumns; i++) {
        dataRow.addDatum('val');
      }
      this.rows.push(dataRow);
    }
    console.log('rows: ', this.rows);
  }

  getTable(){
    let offset: number = 0;
    let limit: number = 10;
    let tableState = null;
    this.resourceService.getDataTable(tableState, offset, limit)
  }

  getDimensionsBelow(dimension: Dimension, dimensions: Dimension[]): Dimension[] {
    let dimensionsBelow = [];
    let index = dimensions.indexOf(dimension);
    for (let i = index + 1; i < dimensions.length; i++) {
      dimensionsBelow.push(dimensions[i]);
    }
    return dimensionsBelow;
  }

  getDimensionsAbove(dimension: Dimension, dimensions: Dimension[]): Dimension[] {
    let dimensionsAbove = [];
    let index = dimensions.indexOf(dimension);
    for (let i = index - 1; i >= 0; i--) {
      dimensionsAbove.push(dimensions[i]);
    }
    return dimensionsAbove;
  }

  updateTable(savedTable: DataTable){
    let availableDimensions: Dimension[] = this.getAvailableDimensions();
    this.updateTableToDefaultState(availableDimensions);

    if(savedTable.columnDimensions.length > 0) {
      this.columnDimensions = availableDimensions.filter(dim =>
        savedTable.columnDimensions.map(it => it.name).includes(dim.name));
      this.columnDimensions.forEach(dim => dim.selected = true);
      this.rowDimensions = availableDimensions.filter(dim => !this.columnDimensions.map(it => it.name).includes(dim.name));
    }

    if (savedTable.rowDimensions.length > 0) {
      this.rowDimensions.forEach(dim => {
          if (savedTable.rowDimensions.map(it => it.name).includes(dim.name)) {
            dim.selected = true
      }});
    }

  }

  private updateTableToDefaultState(availableDimensions: Dimension[]){
    availableDimensions.forEach(dim => dim.selected = false);
    this.columnDimensions.length = 0;
    this.rowDimensions = availableDimensions;
  }

  private getAvailableDimensions(): Dimension[] {
    return this.rowDimensions.concat(this.columnDimensions);
  }

  get rowDimensions(): Dimension[] {
    return this.dataTable.rowDimensions;
  }

  set rowDimensions(value: Dimension[]) {
    this.dataTable.rowDimensions = value;
  }

  get columnDimensions(): Dimension[] {
    return this.dataTable.columnDimensions;
  }

  set columnDimensions(value: Dimension[]) {
    this.dataTable.columnDimensions = value;
  }

  get rows(): Row[] {
    return this.dataTable.rows;
  }

  set row(value: Row[]) {
    this.dataTable.rows = value;
  }

  get dataTable(): DataTable {
    return this._dataTable;
  }

  set dataTable(value: DataTable) {
    this._dataTable = value;
  }
}
