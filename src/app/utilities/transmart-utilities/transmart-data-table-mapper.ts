/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TableDimension} from '../../models/table-models/table-dimension';
import {Row} from '../../models/table-models/row';
import {TransmartColumnHeaders} from '../../models/transmart-models/transmart-column-headers';
import {DataTable} from '../../models/table-models/data-table';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TableDimensionValue} from '../../models/table-models/table-dimension-value';
import {TransmartTableDimension} from '../../models/transmart-models/transmart-table-dimension';
import {Col} from '../../models/table-models/col';
import {TransmartRowHeader} from '../../models/transmart-models/transmart-row-header';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartStudyDimensions} from '../../models/transmart-models/transmart-study-dimensions';

export class TransmartDataTableMapper {

  private static getDimensionMetadata(name: string, data: any): Map<string, string> {
    let metadata = new Map<string, string>();
    if (!data) {
      return metadata;
    }
    if (name === 'concept') {
      metadata.set('conceptPath', data.conceptPath);
      metadata.set('conceptCode', data.conceptCode);
    } else if (name === 'trial visit') {
      data.name = data.relTimeLabel;
      for (let property of ['relTimeUnit', 'relTime']) {
        if (property in data && data[property] !== null) {
          metadata.set(property, data[property]);
        }
      }
    } else if (name === 'study') {
    } else if (name === 'visit') {
      const encounterIds: object = data.encounterIds;
      if (data.encounterIds) {
        data.name = data.encounterIds['VISIT_ID'];
        for (let key in encounterIds) {
          if (key !== 'VISIT_ID') {
            metadata.set(key, encounterIds[key]);
          }
        }
      } else {
        data.name = data.id;
      }
    } else if (name === 'patient') {
      const subjectIds: object = data.subjectIds;
      if (subjectIds) {
        data.name = subjectIds['SUBJ_ID'];
        for (let key in subjectIds) {
          if (key !== 'SUBJ_ID') {
            metadata.set(key, subjectIds[key]);
          }
        }
      } else {
        data.name = data.patientId;
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
    transmartTable.rowDimensions.forEach((rowDim: TransmartTableDimension) => {
      let rowDimension = new TableDimension(rowDim.name);
      if (rowDim.elements != null) {
        let elements = this.convertObjectToMap(rowDim.elements);
        elements.forEach((value: Map<string, object>, key: string) => {
          rowDimension.values.push(new TableDimensionValue(key, this.getDimensionMetadata(rowDim.name, value)));
        });
      } else {
        rowDimension.values.push(new TableDimensionValue(null));
      }
      dataTable.rowDimensions.push(rowDimension);
    });

    // get column dimensions
    transmartTable.columnDimensions.forEach((colDim: TransmartTableDimension) => {
      let colDimension = new TableDimension(colDim.name);
      if (colDim.elements != null) {
        let elements = this.convertObjectToMap(colDim.elements);
        elements.forEach((value: Map<string, object>, key: string) => {
          colDimension.values.push(new TableDimensionValue(key, this.getDimensionMetadata(colDim.name, value)));
        });
      } else {
        colDimension.values.push(new TableDimensionValue(null));
      }
      dataTable.columnDimensions.push(colDimension);
    });

    // get data table column-header rows
    transmartTable.columnHeaders.forEach((transmartColumnHeader: TransmartColumnHeaders) => {
      let row = new Row();
      row.isHeaderRow = true;

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
            let indexedDimension: TransmartTableDimension = transmartTable.columnDimensions.filter(
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
          let indexedDimension: TransmartTableDimension = transmartTable.rowDimensions
            .filter(dim => dim.name === rowHeader.dimension)[0];
          let dimensionObject = indexedDimension.elements[rowHeader.key];
          let val: any;
          if (headerNameField in dimensionObject) {
            val = dimensionObject[headerNameField];
          } else {
            val = dimensionObject.label;
          }
          newRow.addHeader(val, this.getDimensionMetadata(indexedDimension.name, dimensionObject));
        } else {
          newRow.addHeader(rowHeader.element);
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
