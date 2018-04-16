import {Query} from '../../models/query-models/query';
import {TransmartQuery} from '../../models/transmart-models/transmart-query';
import {DataTable} from '../../models/table-models/data-table';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {Dimension} from '../../models/table-models/dimension';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartRow} from '../../models/transmart-models/transmart-row';
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
import {DimensionValue} from "../../models/table-models/dimension-value";

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

  public static mapTransmartDataTable(transmartTable: TransmartDataTable): DataTable {
    let dataTable = new DataTable();
    transmartTable.rows.forEach((transmartRow: TransmartRow) => {
      // get data table rows
      let newRow: Row = new Row();
      transmartRow.row.forEach(value => newRow.addDatum(value));
      dataTable.rows.push(newRow);

      // get data table rows
      transmartRow.dimensions.forEach((inRowDim: TransmartInRowDimension) => {
        let rowDim: Dimension = new Dimension(inRowDim.dimension);
        if (inRowDim.key === null) {
          // if dimension is inline
          rowDim.values.push(new DimensionValue(inRowDim.element['label'],
            this.getDimensionMetadata(inRowDim.dimension, inRowDim.element)));
        } else {
          // if dimension is indexed
          let indexedDimension: TransmartDimension = transmartTable.rowDimensions.filter(
            dim => dim.name === inRowDim.dimension)[0];
          rowDim.values.push(new DimensionValue(indexedDimension.elements[inRowDim.key].label,
            this.getDimensionMetadata(indexedDimension.name, indexedDimension.elements[inRowDim.key])));
        }
      });
    });

    // get data table cols
    transmartTable.columnHeaders.forEach((transmartColumnHeader: TransmartColumnHeaders) => {
      let headerRow = new HeaderRow();
      if (transmartColumnHeader.keys === null) {
        // if dimension is inline
        transmartColumnHeader.elements.forEach(elem => {
          this.updateCols(headerRow.cols, elem['label'], elem);
        });
      } else {
        transmartColumnHeader.keys.forEach((key: string) => {
          if (key === null) {
            this.updateCols(headerRow.cols, null, null);
          } else {
            // if dimension is indexed
            let indexedDimension: TransmartDimension = transmartTable.columnDimensions.filter(
              dim => dim.name === transmartColumnHeader.dimension)[0];
            this.updateCols(headerRow.cols, indexedDimension.elements[key].label,
              this.getDimensionMetadata(indexedDimension.name, indexedDimension.elements[key]));
          }
        });
      }
      dataTable.headerRows.push(headerRow);
    });

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

}
