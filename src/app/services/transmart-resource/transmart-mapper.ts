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
      dataTable.rowDimensions
        .filter(dim => dim.selected).map(dim => dim.name) : [];
    let columnDimensionNames = dataTable.columnDimensions.length > 0 ?
      dataTable.columnDimensions
        .filter(dim => dim.selected).map(dim => dim.name) : [];
    let sorting = null;

    return new TransmartTableState(rowDimensionNames, columnDimensionNames, sorting);
  }

  public static mapTransmartDataTable(transmartTable: TransmartDataTable): DataTable {
    let dataTable = new DataTable();
    transmartTable.rows.forEach((transmartRow: TransmartRow) => {
      // get data table rows
      let newRow: Row = new Row();
      newRow.length = transmartRow.dimensions.length + transmartRow.row.length;
      transmartRow.row.forEach(value => newRow.addDatum(value));
      dataTable.rows.push(newRow);

      // get data table row dimensions
      transmartRow.dimensions.forEach((inRowDim: TransmartInRowDimension) => {
        let rowDim: Dimension = new Dimension(inRowDim.dimension);
        if (inRowDim.index == null) {
          // if dimension is inline
          if (inRowDim.element != null) {
            rowDim.valueNames.push(inRowDim.element.label)
          } else {
            // error
          }
        } else {
          // if dimension is indexed
          let indexedDimension: TransmartDimension = transmartTable.rowDimensions.filter(
            dim => dim.name === inRowDim.dimension)[0];
          rowDim.valueNames.push(indexedDimension.elements[inRowDim.index].label);
        }
      });
    });

    // get data table column dimensions
    transmartTable.columnDimensions.forEach((transmartColDim: TransmartDimension) => {
      let colDim: Dimension = new Dimension(transmartColDim.name);
      if (transmartColDim.indexes != null && transmartColDim.indexes.length > 0) {
        // indexed dimensions
        transmartColDim.indexes.forEach((index: number) => {
          if (index == null) {
            colDim.valueNames.push(null);
          } else {
            colDim.valueNames.push(transmartColDim.elements[index].label);
          }
        });
      } else {
        // inline dimensions
        transmartColDim.elements.forEach(elem => {
          if (elem == null) {
            colDim.valueNames.push(null);
          } else {
            colDim.valueNames.push(elem.label);
          }
        });
      }
      dataTable.columnDimensions.push(colDim);
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
}
