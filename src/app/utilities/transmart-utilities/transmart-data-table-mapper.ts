/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Dimension} from '../../models/table-models/dimension';
import {Row} from '../../models/table-models/row';
import {TransmartColumnHeaders} from '../../models/transmart-models/transmart-column-headers';
import {DataTable} from '../../models/table-models/data-table';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {DimensionValue} from '../../models/table-models/dimension-value';
import {TransmartDimension} from '../../models/transmart-models/transmart-dimension';
import {Col} from '../../models/table-models/col';
import {TransmartRowHeader} from '../../models/transmart-models/transmart-row-header';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartStudyDimensions} from '../../models/transmart-models/transmart-study-dimensions';

export class TransmartDataTableMapper {

  private static getDimensionMetadata(name: string, data: any): Map<string, string> {
    let metadata = new Map<string, string>();
    if (name === 'concept') {
      metadata.set('conceptPath', data.conceptPath);
      metadata.set('conceptCode', data.conceptCode);
      metadata.set('name', data.name);
    } else if (name === 'trial visit') {
      metadata.set('relTimeLabel', data.relTimeLabel);
      metadata.set('relTimeUnit', data.relTimeUnit);
      metadata.set('relTime', data.relTime);
    } else if (name === 'study') {
      metadata.set('label', data.label)
    } else if (name === 'patient') {
      let subjectIds: object = data.subjectIds;
      if (subjectIds) {
        for (let key in subjectIds) {
          metadata.set(key, subjectIds[key]);
        }
      }
    } else {
      // No metadata
    }
    return metadata
  }

  private static convertObjectToMap(object) {
    let strMap = new Map();
    for (let k of Object.keys(object)) {
      strMap.set(k, object[k]);
    }
    return strMap;
  }

  private static getOffsetIndex(limit: number, requestedOffset: number, totalNumberOfRows?: number): number {
    if (totalNumberOfRows != null && totalNumberOfRows > limit) {
      // skip first few rows of returned results
      return limit - (totalNumberOfRows - requestedOffset)
    } else {
      // start from the first row
      return 0;
    }
  }

  public static mapDataTableToTableState(dataTable: DataTable): TransmartTableState {
    let rowDimensionNames = dataTable.rowDimensions.length > 0 ?
      dataTable.rowDimensions.map(dim => dim.name) : [];
    let columnDimensionNames = dataTable.columnDimensions.length > 0 ?
      dataTable.columnDimensions.map(dim => dim.name) : [];

    return new TransmartTableState(rowDimensionNames, columnDimensionNames);
  }

  /**
   * Maps data table response from TranSMART to a Data table object.
   *
   * @param {TransmartDataTable} transmartTable
   * @param {number} requestedOffset
   * @param {number} limit
   * @return {DataTable}
   */
  public static mapTransmartDataTable(transmartTable: TransmartDataTable,
                                      requestedOffset: number, limit: number): DataTable {
    let dataTable = new DataTable();
    const headerNameField = 'name';
    dataTable.currentPage = requestedOffset / dataTable.limit + 1;
    dataTable.offset = requestedOffset;

    // check if it is a last page
    dataTable.isLastPage = transmartTable.rowCount != null;

    // get row dimensions
    transmartTable.rowDimensions.forEach((rowDim: TransmartDimension) => {
      let rowDimension = new Dimension(rowDim.name);
      if (rowDim.elements != null) {
        let elements = this.convertObjectToMap(rowDim.elements);
        elements.forEach((value: Map<string, object>, key: string) => {
          rowDimension.values.push(new DimensionValue(key, this.getDimensionMetadata(rowDim.name, value)));
        });
      } else {
        rowDimension.values.push(new DimensionValue(null));
      }
      dataTable.rowDimensions.push(rowDimension);
    });

    // get column dimensions
    transmartTable.columnDimensions.forEach((colDim: TransmartDimension) => {
      let colDimension = new Dimension(colDim.name);
      if (colDim.elements != null) {
        let elements = this.convertObjectToMap(colDim.elements);
        elements.forEach((value: Map<string, object>, key: string) => {
          colDimension.values.push(new DimensionValue(key, this.getDimensionMetadata(colDim.name, value)));
        });
      } else {
        colDimension.values.push(new DimensionValue(null));
      }
      dataTable.columnDimensions.push(colDimension);
    });

    // get data table column-header rows
    transmartTable.columnHeaders.forEach((transmartColumnHeader: TransmartColumnHeaders) => {
      let row = new Row();

      // add empty space fillers on the top-left corner of the table
      for (let rowIndex = 0; rowIndex < dataTable.rowDimensions.length; rowIndex++) {
        row.addDatum('');
      }

      if (transmartColumnHeader.elements) {
        // if dimension is inline
        transmartColumnHeader.elements.forEach(elem =>
            row.addDatum(elem)
        );
      } else {
        transmartColumnHeader.keys.forEach((key: string) => {
          if (key == null) {
            row.addDatum(null, null);
          } else {
            // if dimension is indexed
            let indexedDimension: TransmartDimension = transmartTable.columnDimensions.filter(
              dim => dim.name === transmartColumnHeader.dimension)[0];
            let metadata = this.getDimensionMetadata(indexedDimension.name, indexedDimension.elements[key]);
            let val = indexedDimension.elements[key][headerNameField];
            val = val ? val : indexedDimension.elements[key].label;
            row.addDatum(val, metadata);
          }
        });
      }
      dataTable.rows.push(row);
    });

    // get data table rows
    let offsetIndex = this.getOffsetIndex(limit, requestedOffset, transmartTable.rowCount);
    for (let i = offsetIndex; i < transmartTable.rows.length; i++) {
      let newRow: Row = new Row();
      // get row dimensions
      transmartTable.rows[i].rowHeaders.forEach((rowHeader: TransmartRowHeader) => {
        if (rowHeader.key) {
          // if dimension is indexed
          let indexedDimension: TransmartDimension = transmartTable.rowDimensions
            .filter(dim => dim.name === rowHeader.dimension)[0];
          let dimensionObject = indexedDimension.elements[rowHeader.key];
          let val: any;
          if (headerNameField in dimensionObject) {
            val = dimensionObject[headerNameField];
          } else {
            val = dimensionObject.label;
          }
          newRow.addDatum(val, this.getDimensionMetadata(indexedDimension.name, dimensionObject));
        } else {
          newRow.addDatum(rowHeader.element);
        }
      });
      // get row values
      transmartTable.rows[i].cells.forEach(value => newRow.addDatum(value));

      dataTable.rows.push(newRow);
    }

    // get cols
    if (dataTable.rows.length > 0) {
      for (let field in dataTable.rows[0].data) {
        let col = new Col(' - ', field, dataTable.rows[0].metadata[field]);
        dataTable.cols.push(col);
      }
    }
    return dataTable;
  }

  /**
   * Merge available dimensions and current table state
   * @param {TransmartStudyDimensions} transmartStudyDimensions
   * @param {DataTable} currentDataTable
   * @return {TransmartTableState}
   */
  public static mapStudyDimensionsToTableState(transmartStudyDimensions: TransmartStudyDimensions,
                                               currentDataTable: DataTable): TransmartTableState {
    const highDimDimensions = ['assay', 'biomarker', 'projection'];
    let availableDimensionNames = transmartStudyDimensions.availableDimensions
      .map(dimension => dimension.name)
      .filter(dimension => !highDimDimensions.includes(dimension));
    let rowDimensionsNames = currentDataTable.rowDimensions
      .map(dimension => dimension.name)
      .filter(name => availableDimensionNames.includes(name));
    let columnDimensionsNames = currentDataTable.columnDimensions
      .map(dimension => dimension.name)
      .filter(name => availableDimensionNames.includes(name));
    let newDimensions = availableDimensionNames.filter(dimension =>
      !rowDimensionsNames.includes(dimension) && !columnDimensionsNames.includes(dimension));
    if (newDimensions.includes('patient')) {
      rowDimensionsNames.push('patient');
      newDimensions.splice(newDimensions.indexOf('patient'), 1);
    }
    newDimensions.forEach(dimension =>
      columnDimensionsNames.push(dimension)
    );

    return new TransmartTableState(rowDimensionsNames, columnDimensionsNames);
  }

}
