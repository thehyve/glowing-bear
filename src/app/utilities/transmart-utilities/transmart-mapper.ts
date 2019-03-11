/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {DataTable} from '../../models/table-models/data-table';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TableDimension} from '../../models/table-models/table-dimension';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {ExportFileFormat} from '../../models/export-models/export-file-format';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {TransmartStudyDimensions} from '../../models/transmart-models/transmart-study-dimensions';
import {Aggregate} from '../../models/aggregate-models/aggregate';
import {NumericalAggregate} from '../../models/aggregate-models/numerical-aggregate';
import {CategoricalAggregate} from '../../models/aggregate-models/categorical-aggregate';
import {FormatHelper} from '../format-helper';
import {CountItem} from '../../models/aggregate-models/count-item';
import {TransmartCountItem} from '../../models/transmart-models/transmart-count-item';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {Study} from '../../models/constraint-models/study';
import {TransmartTrialVisit} from '../../models/transmart-models/transmart-trial-visit';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {ExportJob} from '../../models/export-models/export-job';
import {TransmartExportJob} from '../../models/transmart-models/transmart-export-job';
import {TransmartDimension} from '../../models/transmart-models/transmart-dimension';
import {Dimension} from '../../models/constraint-models/dimension';

export class TransmartMapper {


  public static mapTransmartExportJob(tmExportJob: TransmartExportJob): ExportJob {
    let job = new ExportJob();
    job.id = tmExportJob.id;
    job.name = tmExportJob.jobName;
    job.status = tmExportJob.jobStatus;
    job.time = new Date(tmExportJob.jobStatusTime);
    job.userId = tmExportJob.userId;
    job.viewerURL = tmExportJob.viewerURL;
    job.disabled = tmExportJob.isInDisabledState;
    return job;
  }

  public static mapTransmartExportJobs(tmExportJobs: TransmartExportJob[]): ExportJob[] {
    let exportJobs: ExportJob[] = [];
    tmExportJobs.forEach((tmExportJob: TransmartExportJob) => {
      let job = TransmartMapper.mapTransmartExportJob(tmExportJob);
      exportJobs.push(job);
    });
    return exportJobs;
  }

  public static mapTransmartStudies(transmartStudies: TransmartStudy[]): Study[] {
    let studies: Study[] = [];
    transmartStudies.forEach((tmStudy: TransmartStudy) => {
      studies.push(TransmartMapper.mapTransmartStudy(tmStudy));
    })
    return studies;
  }

  public static mapTransmartStudy(transmartStudy: TransmartStudy): Study {
    let study = new Study();
    study.id = transmartStudy.studyId;
    study.dimensions = transmartStudy.dimensions;
    study.public = transmartStudy.secureObjectToken === 'PUBLIC';
    return study;
  }

  private static parseTransmartQueryBlobDataTable(queryBlob: object): DataTable {
    let dataTable: DataTable = null;

    if (queryBlob && queryBlob['dataTableState']) {
      const transmartTableState: TransmartTableState = queryBlob['dataTableState'];
      dataTable = new DataTable();
      if (transmartTableState.columnDimensions) {
        transmartTableState.columnDimensions.forEach(colName => {
          let dimension: TableDimension = new TableDimension(colName);
          dataTable.columnDimensions.push(dimension);
        });
      }
      if (transmartTableState.rowDimensions) {
        transmartTableState.rowDimensions.forEach(rowName => {
          let dimension: TableDimension = new TableDimension(rowName);
          dataTable.rowDimensions.push(dimension);
        });
      }
    }
    return dataTable;
  }

  public static mapTransmartCountItem(tmCountItem: TransmartCountItem): CountItem {
    return new CountItem(tmCountItem.patientCount, tmCountItem.observationCount);
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
            el.dataView = defaultDataView;
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
    if (aggObj) {
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
    }

    return aggregate;
  }

  public static mapTransmartCategoricalConceptAggregate(tmCategoricalConceptAggregate: object,
                                                        conceptCode: string): CategoricalAggregate {
    let aggregate: CategoricalAggregate = new CategoricalAggregate();
    let aggObj = tmCategoricalConceptAggregate[conceptCode];
    if (aggObj) {
      const countObj = aggObj['valueCounts'];
      for (let key in countObj) {
        aggregate.valueCounts.set(key, countObj[key]);
      }
      const nullCount = aggObj['nullValueCounts'];
      if (nullCount && nullCount > 0) {
        (<CategoricalAggregate>aggregate).valueCounts.set(FormatHelper.nullValuePlaceholder, nullCount);
      }
    }
    return aggregate;
  }

  public static mapTransmartTrialVisit(tmTrialVisit: TransmartTrialVisit): TrialVisit {
    let tv = new TrialVisit(tmTrialVisit.id);
    tv.relTime = Number(tmTrialVisit.relTime);
    tv.relTimeunit = tmTrialVisit.relTimeUnit;
    tv.relTimeLabel = tmTrialVisit.relTimeLabel;
    return tv;
  }

  public static mapTransmartTrialVisits(tmTrialVisits: TransmartTrialVisit[]): TrialVisit[] {
    return tmTrialVisits.map((visit: TransmartTrialVisit) => {
      return TransmartMapper.mapTransmartTrialVisit(visit);
    })
  }

  /**
   * Combine metadata from a list of studies into an object that captures available dimensions
   * and an initial data table state (row and column dimensions).
   *
   * @param {Study[]} studies
   * @return {TransmartStudyDimensions}
   */
  public static mergeStudyDimensions(studies: TransmartStudy[]): TransmartStudyDimensions {
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
        transmartStudyDimensions.availableDimensions.push(new TableDimension(name));
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

  public static mapDimensions(transmartDimensions: TransmartDimension[]) {
    return transmartDimensions.sort(function (a, b) {
      return a.sortIndex - b.sortIndex;
    }).map(transmartDimension => new Dimension(transmartDimension.name));
  }
}
