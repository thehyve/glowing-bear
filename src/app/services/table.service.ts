import {Injectable} from '@angular/core';
import {Dimension} from '../models/table-models/dimension';
import {DataTable} from '../models/table-models/data-table';
import {Row} from '../models/table-models/row';
import {ResourceService} from './resource.service';
import {Col} from '../models/table-models/col';
import {ConstraintService} from './constraint.service';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {HeaderRow} from '../models/table-models/header-row';
import {DimensionValue} from "../models/table-models/dimension-value";

@Injectable()
export class TableService {

  private _prevRowDimensions: Array<Dimension>;
  private _prevColDimensions: Array<Dimension>;
  private _dataTable: DataTable;
  private _currentPage: number;
  // Indicate if using merged-cell headers
  private _isUsingHeaders: boolean;

  constructor(private resourceService: ResourceService,
              private constraintService: ConstraintService) {
    this.dataTable = new DataTable();
    this.prevRowDimensions = [];
    this.prevColDimensions = [];
    this.currentPage = 1;
    this.isUsingHeaders = false;

    this.mockDataInit();
    this.mockDataUpdate();

    // TODO: connect to backend calls
   // this.initializeDimensions();
  }

  mockDataInit() {
    // dimensions
    let subjectDim = new Dimension('Subject');
    subjectDim.values.push(new DimensionValue('s1'));
    subjectDim.values.push(new DimensionValue('s2'));
    subjectDim.values.push(new DimensionValue('s3'));
    subjectDim.values.push(new DimensionValue('s4'));
    subjectDim.values.push(new DimensionValue('s5'));
    subjectDim.values.push(new DimensionValue('s6'));
    subjectDim.values.push(new DimensionValue('s7'));
    subjectDim.values.push(new DimensionValue('s8'));
    let conceptDim = new Dimension('Concept');
    let ageConceptMetadata = new Map([
        [ "concept_path", "/Public Studies/CLINICAL_TRIAL/Demography/Age" ],
        [ "concept_cd", "CT:DEM:AGE"]
      ]);
    conceptDim.values.push(new DimensionValue('Age', ageConceptMetadata));
    let genderConceptMetadata = new Map([
      [ "concept_path", "/Public Studies/CATEGORIVAL_VALUES/Demography/Gender"],
      [ "concept_cd", "CV:DEM:SEX"]
    ]);
    conceptDim.values.push(new DimensionValue(('Gender'), genderConceptMetadata));
    let studyDim = new Dimension('Study');
    studyDim.values.push(new DimensionValue('Study-A'));
    studyDim.values.push(new DimensionValue('Study-B'));
    let visitDim = new Dimension('Visit');
    visitDim.values.push(new DimensionValue('Visit-1'));
    visitDim.values.push(new DimensionValue('Visit-2'));
    visitDim.values.push(new DimensionValue('Visit-3')) ;

    this.rowDimensions.push(subjectDim);
    this.rowDimensions.push(studyDim);
    this.columnDimensions.push(conceptDim);
    this.columnDimensions.push(visitDim);
  }

  mockDataUpdate() {
    // update the old copy of row and col dimensions
    this.prevRowDimensions = this.rowDimensions.slice(0);
    this.prevColDimensions = this.columnDimensions.slice(0);
    this.dataTable.clearCells();

    // generate the column-header rows
    let headerRows: Array<HeaderRow> = [];
    let numColDimColumns = this.columnDimensions.length > 0 ? 1 : 0;
    for (let colIndex = 0; colIndex < this.columnDimensions.length; colIndex++) {
      let colDim = this.columnDimensions[colIndex];
      numColDimColumns = numColDimColumns * colDim.values.length;
      let row = new Row();
      let headerRow = new HeaderRow();

      // add empty space fillers on the top-left corner of the table
      for (let rowIndex = 0; rowIndex < this.rowDimensions.length; rowIndex++) {
        headerRow.cols.push(new Col('', Col.COLUMN_FIELD_PREFIX + (rowIndex + 1).toString()));
        row.addDatum('');
      }

      // add the column header names
      let dimensionsAbove = this.getDimensionsAbove(colDim, this.columnDimensions);
      let selfRepetition = 1;
      for (let dimAbove of dimensionsAbove) {
        selfRepetition = selfRepetition * dimAbove.values.length;
      }
      let dimensionsBelow = this.getDimensionsBelow(colDim, this.columnDimensions);
      let valueRepetition = 1;
      for (let dimBelow of dimensionsBelow) {
        valueRepetition = valueRepetition * dimBelow.values.length;
      }

      for (let i = 0; i < selfRepetition; i++) {
        for (let val of colDim.values) {
          for (let j = 0; j < valueRepetition; j++) {
            headerRow.cols.push(new Col(val.name, Col.COLUMN_FIELD_PREFIX + (headerRow.cols.length + 1).toString(),
              val.metadata));
            row.addDatum(val.name, val.metadata);
          }
        }
      }
      if (this.isUsingHeaders) {
        headerRows.push(headerRow);
      } else {
        this.rows.push(row);
      }
    }
    // generate the data rows
    let dataRows = [];
    let rowDim0 = this.rowDimensions[0];
    // if there at least one row dimension
    if (rowDim0) {
      let dimensionsRight0 = this.getDimensionsBelow(rowDim0, this.rowDimensions);
      let valueRepetition0 = 1;
      for (let dimRight of dimensionsRight0) {
        valueRepetition0 = valueRepetition0 * dimRight.values.length;
      }
      for (let val of rowDim0.values) {
        for (let j = 0; j < valueRepetition0; j++) {
          let row = new Row();
          row.addDatum(val.name, val.metadata);
          dataRows.push(row);
        }
      }
      let index = 0;
      for (let rowIndex = 1; rowIndex < this.rowDimensions.length; rowIndex++) {
        let rowDim = this.rowDimensions[rowIndex];
        let dimensionsLeft = this.getDimensionsAbove(rowDim, this.rowDimensions);
        let selfRepetition = 1;
        for (let dimLeft of dimensionsLeft) {
          selfRepetition = selfRepetition * dimLeft.values.length;
        }
        let dimensionsRight = this.getDimensionsBelow(rowDim, this.rowDimensions);
        let valueRepetition = 1;
        for (let dimRight of dimensionsRight) {
          valueRepetition = valueRepetition * dimRight.values.length;
        }
        for (let i = 0; i < selfRepetition; i++) {
          for (let val of rowDim.values) {
            for (let j = 0; j < valueRepetition; j++) {
              dataRows[index].addDatum(val.name, val.metadata);
              let nIndex = index + 1;
              index = (nIndex === dataRows.length) ? 0 : nIndex;
            }
          }
        }
      }
    } else {// if there is no row dimension
      dataRows.push(new Row());
    }
    for (let dataRowIndex = 0; dataRowIndex < dataRows.length; dataRowIndex++) {
      let dataRow = dataRows[dataRowIndex];
      for (let i = 0; i < numColDimColumns; i++) {
        dataRow.addDatum('val');
      }
      if (numColDimColumns === 0) {
        dataRow.addDatum('val');
      }
      this.rows.push(dataRow);
    }
    // generate column headers
    if (this.isUsingHeaders) {
      headerRows.forEach((headerRow: HeaderRow) => {
        let newColRow = new HeaderRow();
        headerRow.cols.forEach((col: Col) => {
          if (newColRow.cols.length > 0) {
            if (newColRow.cols[newColRow.cols.length - 1].header === col.header && col.header !== '') {
              newColRow.cols[newColRow.cols.length - 1].colspan += 1;
            } else {
              newColRow.cols.push(col)
            }
          } else {
            newColRow.cols.push(col)
          }
        });
        this.dataTable.headerRows.push(newColRow);
      });
    } else {
      for (let field in this.rows[0].data) {
        let col = new Col(' - ', field, this.rows[0].metadata[field]);
        this.dataTable.cols.push(col);
      }
    }
  }

  initializeDimensions() {
    const selectionConstraint = this.constraintService.generateSelectionConstraint();
    const projectionConstraint = this.constraintService.generateProjectionConstraint();
    let combo = new CombinationConstraint();
    combo.addChild(selectionConstraint);
    combo.addChild(projectionConstraint);
    this.dataTable.constraint = combo;
    this.resourceService.getDimensions(combo)
      .subscribe((availableDimensions: Dimension[]) => {
        this.dataTable.rowDimensions = availableDimensions;
        this.updateTable(this.dataTable);
      });
  }

  updateTable(targetDataTable: DataTable) {
    let offset = 0;
    let limit = 10;
    this.resourceService
      .getDataTable(targetDataTable, offset, limit)
      .subscribe(
        (newDataTable: DataTable) => {
          this.dataTable = newDataTable;
        }
      );
  }

  private getDimensionsBelow(dimension: Dimension, dimensions: Dimension[]): Dimension[] {
    let dimensionsBelow = [];
    let index = dimensions.indexOf(dimension);
    for (let i = index + 1; i < dimensions.length; i++) {
      dimensionsBelow.push(dimensions[i]);
    }
    return dimensionsBelow;
  }

  private getDimensionsAbove(dimension: Dimension, dimensions: Dimension[]): Dimension[] {
    let dimensionsAbove = [];
    let index = dimensions.indexOf(dimension);
    for (let i = index - 1; i >= 0; i--) {
      dimensionsAbove.push(dimensions[i]);
    }
    return dimensionsAbove;
  }

  public nextPage() {
    // TODO: connect to backend, check if the last page is reached
    this.currentPage++;
  }

  public previousPage() {
    // TODO: connect to backend, check if the first page is reached
    this.currentPage--;
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

  get cols(): Col[] {
    return this.dataTable.cols;
  }

  get headerRows(): Array<HeaderRow> {
    return this.dataTable.headerRows;
  }

  get dataTable(): DataTable {
    return this._dataTable;
  }

  set dataTable(value: DataTable) {
    this._dataTable = value;
  }

  get prevRowDimensions(): Array<Dimension> {
    return this._prevRowDimensions;
  }

  set prevRowDimensions(value: Array<Dimension>) {
    this._prevRowDimensions = value;
  }

  get prevColDimensions(): Array<Dimension> {
    return this._prevColDimensions;
  }

  set prevColDimensions(value: Array<Dimension>) {
    this._prevColDimensions = value;
  }

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
  }

  get isUsingHeaders(): boolean {
    return this._isUsingHeaders;
  }

  set isUsingHeaders(value: boolean) {
    this._isUsingHeaders = value;
  }
}
