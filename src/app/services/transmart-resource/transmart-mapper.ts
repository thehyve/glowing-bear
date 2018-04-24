import {Query} from '../../models/query-models/query';
import {TransmartQuery} from '../../models/transmart-models/transmart-query';
import {DataTable} from '../../models/table-models/data-table';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {Dimension} from '../../models/table-models/dimension';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {Row} from '../../models/table-models/row';
import {TransmartInRowDimension} from '../../models/transmart-models/transmart-in-row-dimension';
import {TransmartDimension} from '../../models/transmart-models/transmart-dimension';
import {TransmartStudyDimensionElement} from '../../models/transmart-models/transmart-study-dimension-element';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {ExportFileFormat} from '../../models/export-models/export-file-format';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {Col} from '../../models/table-models/col';
import {TransmartColumnHeaders} from '../../models/transmart-models/transmart-column-headers';
import {HeaderRow} from '../../models/table-models/header-row';
import {DimensionValue} from '../../models/table-models/dimension-value';
import {TransmartStudy} from "../../models/transmart-models/transmart-study";
import {TransmartStudiesDimensions} from "../../models/transmart-models/transmart-studies-dimensions";

export class TransmartMapper {

  public static mapTransmartQueries(transmartQueries: TransmartQuery[]): Query[] {
    let queries: Query[] = [];
    transmartQueries.forEach(tmQuery => {
      queries.push(this.mapTransmartQuery(tmQuery));
    });
    return queries;
  }

  public static mapTransmartQuery(transmartQuery: TransmartQuery): Query {
    let query = new Query(transmartQuery.id, transmartQuery.name);
    query.createDate = transmartQuery.createDate;
    query.updateDate = transmartQuery.updateDate;
    query.bookmarked = transmartQuery.bookmarked;
    query.patientsQuery = transmartQuery.patientsQuery;
    query.observationsQuery = transmartQuery.observationsQuery;
    query.apiVersion = transmartQuery.apiVersion;
    query.subscribed = transmartQuery.subscribed;
    query.subscriptionFreq = transmartQuery.subscriptionFreq;
    query.dataTable = this.parseTransmartQueryBlob(transmartQuery.queryBlob);

    return query;
  }

  private static parseTransmartQueryBlob(queryBlob: object) {
    let dataTable: DataTable = null;

    if (queryBlob && queryBlob['dataTableState']) {
      const transmartTableState: TransmartTableState = queryBlob['dataTableState'];
      dataTable = new DataTable();
      if (transmartTableState.columnDimensions) {
        transmartTableState.columnDimensions.forEach(colName => {
          let dimension: Dimension = new Dimension(colName);
          dataTable.columnDimensions.push(dimension);
        });
      }
      if (transmartTableState.rowDimensions) {
        transmartTableState.rowDimensions.forEach(rowName => {
          let dimension: Dimension = new Dimension(rowName);
          dataTable.rowDimensions.push(dimension);
        });
      }

    }
    return dataTable;
  }

  public static mapQuery(query: Query): TransmartQuery {
    let transmartTableState: TransmartTableState = this.mapDataTable(query.dataTable);
    let transmartQuery: TransmartQuery = new TransmartQuery(query.name);
    transmartQuery.patientsQuery = query.patientsQuery;
    transmartQuery.observationsQuery = query.observationsQuery;
    transmartQuery.queryBlob = {dataTableState: transmartTableState};

    return transmartQuery;
  }

  public static mapDataTable(dataTable: DataTable): TransmartTableState {
    let rowDimensionNames = dataTable.rowDimensions.length > 0 ?
      dataTable.rowDimensions.map(dim => dim.name) : [];
    let columnDimensionNames = dataTable.columnDimensions.length > 0 ?
      dataTable.columnDimensions.map(dim => dim.name) : [];

    return new TransmartTableState(rowDimensionNames, columnDimensionNames);
  }

  public static mapTransmartDataTable(transmartTable: TransmartDataTable, isUsingHeaders: boolean,
                                      requestedOffset: number, limit: number): DataTable {
    let dataTable = new DataTable();
    let numberOfRows: number = transmartTable.rows.length;
    const headerNameField = 'name';

    // check if it is a last page
    let rowCount = transmartTable['row count'];
    dataTable.isLastPage = rowCount != null;

    // get row dimensions
    transmartTable.row_dimensions.forEach((rowDim: TransmartDimension) => {
      let rowDimension = new Dimension(rowDim.name);
      let elements = this.parseObjectToMap(rowDim.elements);
      elements.forEach((value: Map<string, object>, key: string) => {
        rowDimension.values.push(new DimensionValue(key, this.getDimensionMetadata(rowDim.name, value)));
      });
      dataTable.rowDimensions.push(rowDimension);
    });

    // get column dimensions
    transmartTable.column_dimensions.forEach((colDim: TransmartDimension) => {
      let colDimension = new Dimension(colDim.name);
      let elements = this.parseObjectToMap(colDim.elements);
      elements.forEach((value: Map<string, object>, key: string) => {
        colDimension.values.push(new DimensionValue(key, this.getDimensionMetadata(colDim.name, value)));
      });
      dataTable.columnDimensions.push(colDimension);
    });

    // get data table column-header rows
    transmartTable.column_headers.forEach((transmartColumnHeader: TransmartColumnHeaders) => {
      let headerRow = new HeaderRow();
      let row = new Row();

      // add empty space fillers on the top-left corner of the table
      for (let rowIndex = 0; rowIndex < dataTable.rowDimensions.length; rowIndex++) {
        if (isUsingHeaders) {
          headerRow.cols.push(new Col('', Col.COLUMN_FIELD_PREFIX + (rowIndex + 1).toString()));
        } else {
          row.addDatum('');
        }
      }

      if (transmartColumnHeader.keys == null) {
        // if dimension is inline
        transmartColumnHeader.elements.forEach(elem => {
          let metadata = this.getDimensionMetadata(transmartColumnHeader.dimension, elem);
          if (isUsingHeaders) {
            this.updateCols(headerRow.cols, elem[headerNameField], metadata);
          } else {
            row.addDatum(elem[headerNameField], metadata);
          }
        });
      } else {
        transmartColumnHeader.keys.forEach((key: string) => {
          if (key == null) {
            if (isUsingHeaders) {
              this.updateCols(headerRow.cols, null, null);
            } else {
              row.addDatum(null, null);
            }
          } else {
            // if dimension is indexed
            let indexedDimension: TransmartDimension = transmartTable.column_dimensions.filter(
              dim => dim.name === transmartColumnHeader.dimension)[0];
            let metadata = this.getDimensionMetadata(indexedDimension.name, indexedDimension.elements[key]);
            let val = indexedDimension.elements[key][headerNameField];
            val = val ? val : indexedDimension.elements[key].label;
            if (isUsingHeaders) {
              this.updateCols(headerRow.cols, val, metadata);
            } else {
              row.addDatum(val, metadata);
            }
          }
        });
      }
      if (isUsingHeaders) {
        dataTable.headerRows.push(headerRow);
      } else {
        dataTable.rows.push(row);
      }
    });

    // get data table rows
    let offsetIndex = this.getOffsetIndex(limit, requestedOffset, rowCount);
    for (let i = offsetIndex; i < transmartTable.rows.length; i++) {
      let newRow: Row = new Row();
      // get row dimensions
      transmartTable.rows[i].dimensions.forEach((inRowDim: TransmartInRowDimension) => {
        if (inRowDim.key == null) {
          // if dimension is inline
          newRow.addDatum(inRowDim.element[headerNameField],
            this.getDimensionMetadata(inRowDim.dimension, inRowDim.element));
        } else {
          // if dimension is indexed
          let indexedDimension: TransmartDimension = transmartTable.row_dimensions
            .filter(dim => dim.name === inRowDim.dimension)[0];
          let val = indexedDimension.elements[inRowDim.key][headerNameField];
          val = val ? val : indexedDimension.elements[inRowDim.key].label;
          newRow.addDatum(val, this.getDimensionMetadata(indexedDimension.name, indexedDimension.elements[inRowDim.key]));
        }
      });
      // get row values
      transmartTable.rows[i].row.forEach(value => newRow.addDatum(value));

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

  public static mapTransmartStudyDimensionElements(elements: TransmartStudyDimensionElement[]): string[] {
    return elements.map(elem => elem.name);
  }

  public static mapTransmartExportFormats(fileFormatNames: string[], dataFormatNames: string[]): ExportDataType[] {
    let dataTypes = new Array<ExportDataType>();
    for (let dataFormatName of dataFormatNames) {
      let dataType = new ExportDataType(dataFormatName, true);
      for (let fileFormatName of fileFormatNames) {
        dataType.fileFormats.push(new ExportFileFormat(fileFormatName, true));
      }
      dataTypes.push(dataType);
    }
    return dataTypes;
  }

  public static mapExportDataTypes(dataTypes: ExportDataType[], dataView: string): TransmartExportElement[] {
    let elements: TransmartExportElement[] = [];
    for (let dataType of dataTypes) {
      if (dataType.checked) {
        for (let fileFormat of dataType.fileFormats) {
          if (fileFormat.checked) {
            let el = new TransmartExportElement();
            el.dataType = dataType.name;
            el.format = fileFormat.name;
            el.dataView = dataView;
            elements.push(el);
          }
        }
      }
    }
    return elements;
  }

  public static mapStudiesDimensions(transmartStudies: TransmartStudy[]) {
    const highDims = ['assay', 'projection', 'biomarker', 'missing_value', 'sample_type', 'end time']
    let studiesDimensions = new TransmartStudiesDimensions();

    if (transmartStudies && transmartStudies.length > 0) {
      let dimensions = new Array<Dimension>();

      // get default table format for the study
      if (transmartStudies.length === 1 && transmartStudies[0].metadata != null
        && transmartStudies[0].metadata.defaultTabularRepresentation != null) {
        let rowDimensions = new Array<string>();
        let columnDimensions = new Array<string>();
        transmartStudies[0].metadata.defaultTabularRepresentation.columnDimensions.forEach((dimName: string) =>
          columnDimensions.push(dimName));
        transmartStudies[0].metadata.defaultTabularRepresentation.rowDimensions.forEach((dimName: string) =>
          rowDimensions.push(dimName));

        studiesDimensions.defaultTableRepresentation = new TransmartTableState(rowDimensions, columnDimensions);
      }

      // get dimension arrays for each study
      let availableDimensions = transmartStudies.map(study => study.dimensions);

      // sort to get the shortest dimension at the beginning of the array
      availableDimensions.sort(function (a, b) {
        return a.length - b.length;
      });

      // get common dimensions for all the studies
      let commonDimensions = availableDimensions.shift().filter(function (v) {
        return availableDimensions.every(function (a) {
          return a.indexOf(v) !== -1;
        });
      });

      commonDimensions.forEach((name: string) => {
        if (highDims.indexOf(name) === -1) {
          dimensions.push(new Dimension(name));
        }
      });
      dimensions.forEach((dimension: Dimension) => studiesDimensions.availableDimensions.push(dimension));
    }

    return studiesDimensions;
  }

  public static mapDefaultDimensionsRepresentation(studiesDimensions: TransmartStudiesDimensions, dataTable: DataTable) {
    // update dimensions
    dataTable.clearDimensions();
    if (studiesDimensions.defaultTableRepresentation != null) {
      // study specific default row dimensions
      studiesDimensions.defaultTableRepresentation.rowDimensions.forEach((rowDimension: string) =>
        dataTable.rowDimensions.push(new Dimension(rowDimension)));

      // study specific default column dimensions
      studiesDimensions.defaultTableRepresentation.columnDimensions.forEach((columnDimension: string) =>
        dataTable.columnDimensions.push(new Dimension(columnDimension)));

      // dimensions that are not included in a default representation, but are supported
      // will be column dimensions by default
      studiesDimensions.availableDimensions.forEach((availableDimension: Dimension) => {
        if (!dataTable.rowDimensions.map(dim => dim.name).includes(availableDimension.name)
          && !dataTable.columnDimensions.map(dim => dim.name).includes(availableDimension.name)) {
          dataTable.rowDimensions.push(availableDimension);
        }
      });
    } else {
      // default table representation
      let availableDimensionNames = new Array<string>();
      if (studiesDimensions.availableDimensions != null) {
        studiesDimensions.availableDimensions.forEach((dim: Dimension) => {
          availableDimensionNames.push(dim.name);
        });
        let takenDimensionNames = new Array<string>();
        let newRowDimensions = new Array<Dimension>();
        dataTable.rowDimensions.forEach((dim: Dimension) => {
          if (availableDimensionNames.includes(dim.name)) {
            newRowDimensions.push(dim);
            takenDimensionNames.push(dim.name);
          }
        });
        let newColumnDimensions = new Array<Dimension>();
        dataTable.columnDimensions.forEach((dim: Dimension) => {
          if (availableDimensionNames.includes(dim.name)) {
            newColumnDimensions.push(dim);
            takenDimensionNames.push(dim.name);
          }
        });
        studiesDimensions.availableDimensions.forEach((dim: Dimension) => {
          if (!takenDimensionNames.includes(dim.name)) {
            dataTable.rowDimensions.push(dim);
          }
        });
      }
    }
  }

  private static updateCols(cols: Array<Col>, newColValue, metadata) {
    if (cols != null && cols.length > 0) {
      if (cols[cols.length - 1].header === newColValue) {
        cols[cols.length - 1].colspan += 1;
      } else {
        cols.push(new Col(newColValue, Col.COLUMN_FIELD_PREFIX + (cols.length + 1).toString(), metadata));
      }
    } else {
      cols.push(new Col(newColValue, Col.COLUMN_FIELD_PREFIX + (cols.length + 1).toString(), metadata));
    }
  }

  private static getDimensionMetadata(name: string, data): Map<string, string> {
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
      metadata.set('id', data.id)
    }
    return metadata
  }

  private static parseObjectToMap(object) {
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

}
