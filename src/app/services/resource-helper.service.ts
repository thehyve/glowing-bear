import { Injectable } from '@angular/core';
import {DataTable} from "../models/table-models/data-table";
import {TransmartTableState} from "../models/transmart-resource-models/transmart-table-state";
import {ResourceService} from "./resource.service";
import {TransmartDataTable} from "../models/transmart-resource-models/transmart-data-table";
import {Observable} from "rxjs/Observable";
import {Query} from "../models/query-models/query";
import {TransmartQuery} from "../models/transmart-resource-models/transmart-query";
import {Dimension} from "../models/table-models/dimension";

@Injectable()
export class ResourceHelperService {

  constructor(private resourceService: ResourceService,) { }

  private handle_error(err) {
    console.error(err);
  }

  getDataTable(tableState: DataTable, offset: number, limit: number): Observable<DataTable> {
    const transmartTableState:TransmartTableState = this.parseDataTableToTransmartTableState(tableState);

    const dataTable$ = new Observable<DataTable>((dataTableSource) => {
      this.resourceService.getDataTable(transmartTableState, offset, limit)
        .subscribe((transmartTable: TransmartDataTable) => {
            dataTableSource.next(this.parseTransmartDataTableToDataTable(transmartTable));
            dataTableSource.complete();
          },
          err => this.handle_error(err)
        );

    });

    return dataTable$;
  }

  saveQuery(queryName: string,
            patientConstraintObj: Object,
            observationConstraintObj: { data: string[] },
            dataTable: DataTable): Observable<Query> {

    const dataTableState: TransmartTableState = this.parseDataTableToTransmartTableState(dataTable);
    let transmartQuery: TransmartQuery = new TransmartQuery(queryName);
    transmartQuery.patientsQuery = patientConstraintObj;
    transmartQuery.observationsQuery = observationConstraintObj;
    transmartQuery.queryBlob = {
      dataTableState: dataTableState
    };
    const query$ = new Observable<Query>((querySource) => {
      this.resourceService.saveQuery(transmartQuery)
      .subscribe(
        (newlySavedQuery: TransmartQuery) => {
          querySource.next(this.parseTransmartQueryToQuery(newlySavedQuery));
          querySource.complete();
        }
      );
    });
    return query$;
  }

  /**
   * ----------------------------------------------- TRANSMART PARSERS ------------------------------------------------
   */
  private parseDataTableToTransmartTableState(dataTable: DataTable): TransmartTableState {
    let rowDimensionNames = dataTable.rowDimensions.length > 0 ?
      dataTable.rowDimensions.filter(dim => dim.selected).map(dim => dim.name) : [];
    let columnDimensionNames = dataTable.columnDimensions.length > 0 ?
      dataTable.columnDimensions.filter(dim => dim.selected).map(dim => dim.name) : [];
    let sorting = null;

    return new TransmartTableState(rowDimensionNames, columnDimensionNames, sorting);
  }

  private parseTransmartDataTableToDataTable(transmartTable: TransmartDataTable): DataTable {
    //TODO parsing

    return new DataTable();
  }

  private parseTransmartQueryToQuery(transmartQuery: TransmartQuery): Query {
    const query = new Query(transmartQuery.id, transmartQuery.name);
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

  private parseTransmartQueryBlob(queryBlob: object) {
    let dataTable: DataTable = null;

    if (queryBlob && queryBlob['dataTableState']) {
      const transmartTableState: TransmartTableState = queryBlob['dataTableState'];
      dataTable = new DataTable();
      if(transmartTableState.columnDimensions) {
        transmartTableState.columnDimensions.forEach(colName => {
          let dimension: Dimension = new Dimension(colName);
          dataTable.columnDimensions.push(dimension);
        });
      }
      if(transmartTableState.rowDimensions) {
        transmartTableState.rowDimensions.forEach(rowName => {
          let dimension: Dimension = new Dimension(rowName);
          dataTable.rowDimensions.push(dimension);
        });
      }

    }
    return dataTable;
  }

}
