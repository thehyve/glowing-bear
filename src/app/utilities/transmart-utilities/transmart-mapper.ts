/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Query} from '../../models/query-models/query';
import {TransmartQuery} from '../../models/transmart-models/transmart-query';
import {DataTable} from '../../models/table-models/data-table';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {Dimension} from '../../models/table-models/dimension';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {ExportFileFormat} from '../../models/export-models/export-file-format';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {TransmartStudyDimensions} from '../../models/transmart-models/transmart-study-dimensions';
import {Aggregate} from '../../models/aggregate-models/aggregate';
import {NumericalAggregate} from '../../models/aggregate-models/numerical-aggregate';
import {CategoricalAggregate} from '../../models/aggregate-models/categorical-aggregate';
import {FormatHelper} from '../format-helper';
import {TransmartConstraintMapper} from './transmart-constraint-mapper';
import {CountItem} from '../../models/aggregate-models/count-item';
import {Study} from '../../models/constraint-models/study';
import {TransmartDataTableMapper} from './transmart-data-table-mapper';

export class TransmartMapper {

  public static mapTransmartQueries(transmartQueries: TransmartQuery[]): Query[] {
    let queries: Query[] = [];
    transmartQueries.forEach(tmQuery => {
      try {
        let query = this.mapTransmartQuery(tmQuery);
        queries.push(query);
      } catch (err) {
        console.error(`Error while mapping query: ${tmQuery.name}`, tmQuery);
      }
    });
    return queries;
  }

  public static mapTransmartQuery(transmartQuery: TransmartQuery): Query {
    let query = new Query(transmartQuery.id, transmartQuery.name);
    query.createDate = transmartQuery.createDate;
    query.updateDate = transmartQuery.updateDate;
    query.bookmarked = transmartQuery.bookmarked;
    query.subjectQuery = TransmartConstraintMapper.generateConstraintFromObject(transmartQuery.patientsQuery);
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
    let transmartQuery: TransmartQuery = new TransmartQuery(query.name);
    transmartQuery.patientsQuery = TransmartConstraintMapper.mapConstraint(query.subjectQuery);
    transmartQuery.observationsQuery = query.observationQuery;
    if (query.dataTable) {
      let transmartTableState = TransmartDataTableMapper.mapDataTableToTableState(query.dataTable);
      transmartQuery.queryBlob = {dataTableState: transmartTableState};
    }
    return transmartQuery;
  }

  public static mapTransmartExportFormats(fileFormatNames: string[], dataFormatNames: string[]): ExportDataType[] {
    let dataTypes = [];
    for (let dataFormatName of dataFormatNames) {
      let dataType = new ExportDataType(dataFormatName, true);
      for (let fileFormatName of fileFormatNames) {
        dataType.fileFormats.push(new ExportFileFormat(fileFormatName, true));
      }
      dataTypes.push(dataType);
    }
    return dataTypes;
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

  /**
   * Combine metadata from a list of studies into an object that captures available dimensions
   * and an initial data table state (row and column dimensions).
   *
   * @param {Study[]} studies
   * @return {TransmartStudyDimensions}
   */
  public static mergeStudyDimensions(studies: Study[]): TransmartStudyDimensions {
    let transmartStudyDimensions = new TransmartStudyDimensions();

    if (studies) {
      // Merge lists of available dimensions from all studies
      let availableDimensions = new Set<string>();
      studies.forEach(study =>
        study.dimensions.forEach(dimension =>
          availableDimensions.add(dimension)
        )
      );
      let dimensionsList = [];
      availableDimensions.forEach(dimension =>
        dimensionsList.push(dimension)
      );

      // Sort on length of dimension name
      dimensionsList.sort((a, b) => a.length - b.length);

      dimensionsList.forEach((name: string) => {
        transmartStudyDimensions.availableDimensions.push(new Dimension(name));
      });
    }
    return transmartStudyDimensions;
  }

  public static mapConceptCountObject(obj: object): Map<string, CountItem> {
    let map = new Map<string, CountItem>();
    for (let conceptCode in obj) {
      const counts = obj[conceptCode];
      let item = new CountItem(counts['patientCount'], counts['observationCount']);
      map.set(conceptCode, item);
    }
    return map;
  }

  public static mapStudyCountObject(obj: object): Map<string, CountItem> {
    let map = new Map<string, CountItem>();
    for (let studyId in obj) {
      const counts = obj[studyId];
      let item = new CountItem(counts['patientCount'], counts['observationCount']);
      map.set(studyId, item);
    }
    return map;
  }

  public static mapStudyConceptCountObject(obj: object): Map<string, Map<string, CountItem>> {
    let map = new Map<string, Map<string, CountItem>>();
    for (let studyId in obj) {
      let conceptObj = obj[studyId];
      map.set(studyId, new Map<string, CountItem>());
      for (let conceptCode in conceptObj) {
        const counts = conceptObj[conceptCode];
        let item = new CountItem(counts['patientCount'], counts['observationCount']);
        map.get(studyId).set(conceptCode, item);
      }
    }
    return map;
  }

}
