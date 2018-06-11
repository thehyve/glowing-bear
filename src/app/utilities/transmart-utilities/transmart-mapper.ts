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
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {TransmartStudyDimensions} from '../../models/transmart-models/transmart-study-dimensions';
import {Aggregate} from '../../models/aggregate-models/aggregate';
import {NumericalAggregate} from '../../models/aggregate-models/numerical-aggregate';
import {CategoricalAggregate} from '../../models/aggregate-models/categorical-aggregate';
import {FormatHelper} from '../format-helper';
import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {CrossTable} from '../../models/table-models/cross-table';
import {TransmartConstraintMapper} from './transmart-constraint-mapper';

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
    query.subjectQuery =  TransmartConstraintMapper.generateConstraintFromObject(transmartQuery.patientsQuery);
    query.observationQuery = transmartQuery.observationsQuery;
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
    let transmartTableState: TransmartTableState = query.dataTable ? this.mapDataTableToTableState(query.dataTable) : null;
    let transmartQuery: TransmartQuery = new TransmartQuery(query.name);
    transmartQuery.patientsQuery = TransmartConstraintMapper.mapConstraint(query.subjectQuery);
    transmartQuery.observationsQuery = query.observationQuery;
    transmartQuery.queryBlob = {dataTableState: transmartTableState};

    return transmartQuery;
  }

  public static mapDataTableToTableState(dataTable: DataTable): TransmartTableState {
    let rowDimensionNames = dataTable.rowDimensions.length > 0 ?
      dataTable.rowDimensions.map(dim => dim.name) : [];
    let columnDimensionNames = dataTable.columnDimensions.length > 0 ?
      dataTable.columnDimensions.map(dim => dim.name) : [];

    return new TransmartTableState(rowDimensionNames, columnDimensionNames);
  }

  public static mapTransmartDataTable(transmartTable: TransmartDataTable, isUsingHeaders: boolean,
                                      requestedOffset: number, limit: number): DataTable {
    let dataTable = new DataTable();
    const headerNameField = 'name';
    dataTable.currentPage = requestedOffset / dataTable.limit + 1;
    dataTable.offset = requestedOffset;

    // check if it is a last page
    let rowCount = transmartTable['row count'];
    dataTable.isLastPage = rowCount != null;

    // get row dimensions
    transmartTable.row_dimensions.forEach((rowDim: TransmartDimension) => {
      let rowDimension = new Dimension(rowDim.name);
      if (rowDim.elements != null) {
        let elements = this.parseObjectToMap(rowDim.elements);
        elements.forEach((value: Map<string, object>, key: string) => {
          rowDimension.values.push(new DimensionValue(key, this.getDimensionMetadata(rowDim.name, value)));
        });
      } else {
        rowDimension.values.push(new DimensionValue(null));
      }
      dataTable.rowDimensions.push(rowDimension);
    });

    // get column dimensions
    transmartTable.column_dimensions.forEach((colDim: TransmartDimension) => {
      let colDimension = new Dimension(colDim.name);
      if (colDim.elements != null) {
        let elements = this.parseObjectToMap(colDim.elements);
        elements.forEach((value: Map<string, object>, key: string) => {
          colDimension.values.push(new DimensionValue(key, this.getDimensionMetadata(colDim.name, value)));
        });
      } else {
        colDimension.values.push(new DimensionValue(null));
      }
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
            elem == null ? row.addDatum(null) : row.addDatum(elem[headerNameField], metadata);
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
          if (inRowDim.element == null) {
            // if dimension element is null
            newRow.addDatum(null);
          } else {
            // if dimension is inline
            newRow.addDatum(inRowDim.element[headerNameField],
              this.getDimensionMetadata(inRowDim.dimension, inRowDim.element));
          }
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

  public static mapTransmartCrossTable(tmCrossTable: TransmartCrossTable,
                                       crossTable: CrossTable): CrossTable {
    const matrix = tmCrossTable.rows;

    crossTable.rows = [];
    crossTable.cols = [];
    // add top rows
    let colHeaders = crossTable.columnHeaderConstraints;
    for (let i = 0; i < crossTable.columnConstraints.length; i++) {
      let row = new Row();
      // add blanks
      for (let rowCon of crossTable.rowConstraints) {
        row.addDatumObject({
          isHeader: false,
          value: ''
        })
      }
      // add col headers
      for (let colHeader of colHeaders) {
        row.addDatumObject({
          isHeader: true,
          value: colHeader[i].textRepresentation
        });
      }
      crossTable.rows.push(row);
    }
    // add data rows
    let rowHeaders = crossTable.rowHeaderConstraints;
    for (let i = 0; i < rowHeaders.length; i++) {
      let row = new Row();
      rowHeaders[i].forEach(constraint => {
        row.addDatumObject({
          isHeader: true,
          value: constraint.textRepresentation
        })
      });
      for (let j = 0; j < colHeaders.length; j++) {
        row.addDatumObject({
          isHeader: false,
          value: matrix[i][j]
        })
      }
      crossTable.rows.push(row);
    }
    // add the cols serving as indices for rows
    for (let field in crossTable.rows[0].data) {
      let col = new Col(' - ', field);
      crossTable.cols.push(col);
    }

    return crossTable;
  }

  public static mapExportDataTypes(dataTypes: ExportDataType[], defaultDataView: string): TransmartExportElement[] {
    let elements: TransmartExportElement[] = [];
    for (let dataType of dataTypes) {
      if (dataType.checked) {
        for (let fileFormat of dataType.fileFormats) {
          if (fileFormat.checked) {
            let el = new TransmartExportElement();
            el.dataType = dataType.name;
            el.format = fileFormat.name;
            if (fileFormat.name === 'TSV' && dataType.name === 'clinical') {
              el.dataView = 'dataTable';
            } else {
              el.dataView = defaultDataView;
            }
            elements.push(el);
          }
        }
      }
    }
    return elements;
  }

  public static mapTransmartConceptAggregate(tmConceptAggregate: object, conceptCode: string): Aggregate {
    let aggregate: Aggregate = null;
    let aggObj = tmConceptAggregate[conceptCode];
    if (aggObj['numericalValueAggregates']) {
      aggregate = new NumericalAggregate();
      const numAggObj = aggObj['numericalValueAggregates'];
      (<NumericalAggregate>aggregate).min = numAggObj['min'];
      (<NumericalAggregate>aggregate).max = numAggObj['max'];
      (<NumericalAggregate>aggregate).avg = numAggObj['average'];
      (<NumericalAggregate>aggregate).count = numAggObj['count'];
      (<NumericalAggregate>aggregate).stdDev = numAggObj['std_dev'];
    } else if (aggObj['categoricalValueAggregates']) {
      aggregate = new CategoricalAggregate();
      const catAggObj = aggObj['categoricalValueAggregates'];
      const countObj = catAggObj['valueCounts'];
      for (let key in countObj) {
        (<CategoricalAggregate>aggregate).valueCounts.set(key, countObj[key]);
      }
      const nullCount = catAggObj['nullValueCounts'];
      if (nullCount && nullCount > 0) {
        (<CategoricalAggregate>aggregate).valueCounts.set(FormatHelper.nullValuePlaceholder, nullCount);
      }
    }
    return aggregate;
  }

  public static mapStudyDimensions(transmartStudies: TransmartStudy[]): TransmartStudyDimensions {
    const highDims = ['assay', 'projection', 'biomarker', 'missing_value', 'sample_type'];
    let transmartStudyDimensions = new TransmartStudyDimensions();

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

        transmartStudyDimensions.tableState = new TransmartTableState(rowDimensions, columnDimensions);
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
      dimensions.forEach((dimension: Dimension) => transmartStudyDimensions.availableDimensions.push(dimension));
    }

    return transmartStudyDimensions;
  }

  public static mapStudyDimensionsToTableState(transmartStudyDimensions: TransmartStudyDimensions,
                                               currentDataTable: DataTable): TransmartTableState {
    let rowDimensions: Array<string> = [];
    let columnDimensions: Array<string> = [];
    let bothDimensions = currentDataTable.columnDimensions.concat(currentDataTable.rowDimensions);

    if (this.areAllDimensionsAvailable(bothDimensions, transmartStudyDimensions.availableDimensions)) {

      // table representation is defined
      currentDataTable.columnDimensions.forEach((columnDimension: Dimension) =>
        columnDimensions.push(columnDimension.name));
      currentDataTable.rowDimensions.forEach((dim: Dimension) => {
        if (columnDimensions.indexOf(dim.name) === -1) {
          rowDimensions.push(dim.name);
        }
      });
      transmartStudyDimensions.availableDimensions.forEach((availableDimension: Dimension) => {
        if (!rowDimensions.includes(availableDimension.name)
          && !columnDimensions.includes(availableDimension.name)) {
          rowDimensions.push(availableDimension.name);
        }
      });

    } else {
      // default table representation
      if (transmartStudyDimensions.tableState != null) {

        // study specific default row dimensions
        transmartStudyDimensions.tableState.rowDimensions.forEach((rowDimension: string) =>
          rowDimensions.push(rowDimension));

        // study specific default column dimensions
        transmartStudyDimensions.tableState.columnDimensions.forEach((columnDimension: string) =>
          columnDimensions.push(columnDimension));

        // dimensions that are not included in a default representation, but are supported
        // will be column dimensions by default
        transmartStudyDimensions.availableDimensions.forEach((availableDimension: Dimension) => {
          if (!rowDimensions.includes(availableDimension.name)
            && !columnDimensions.includes(availableDimension.name)) {
            rowDimensions.push(availableDimension.name);
          }
        });
      } else {

        // default row dimensions: all dimensions as rows
        if (transmartStudyDimensions.availableDimensions != null) {
          transmartStudyDimensions.availableDimensions.forEach((dim: Dimension) =>
            rowDimensions.push(dim.name)
          );
        }
      }
    }
    return new TransmartTableState(rowDimensions, columnDimensions);
  }

  private static updateCols(cols: Array<Col>, newColValue, metadata) {
    if (cols != null && cols.length > 0) {
      if (cols[cols.length - 1].header === newColValue) {
        cols[cols.length - 1].colspan += 1;
      } else {
        cols.push(new Col(newColValue, Col.COLUMN_FIELD_PREFIX + (cols.length + 1).toString(), metadata));
      }
    } else {
      cols.push(new Col(newColValue, Col.COLUMN_FIELD_PREFIX + 1, metadata));
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

  private static areAllDimensionsAvailable(dimensions: Array<Dimension>, availableDimensions: Array<Dimension>): boolean {
    return dimensions.every((dim: Dimension) =>
      availableDimensions.map(ad => ad.name).indexOf(dim.name) !== -1);
  }

}
