/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {from as observableFrom, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {Constraint} from '../models/constraint-models/constraint';
import {Pedigree} from '../models/constraint-models/pedigree';
import {ExportJob} from '../models/export-models/export-job';
import {SubjectSet} from '../models/constraint-models/subject-set';
import {TransmartTableState} from '../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../models/transmart-models/transmart-data-table';
import {AppConfig} from '../config/app.config';
import {TransmartCrossTable} from '../models/transmart-models/transmart-cross-table';
import {TransmartCountItem} from '../models/transmart-models/transmart-count-item';
import {SubjectSetConstraint} from '../models/constraint-models/subject-set-constraint';
import {TransmartStudy} from '../models/transmart-models/transmart-study';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {ConstraintMark} from '../models/constraint-models/constraint-mark';
import {flatMap, map} from 'rxjs/operators';
import {TransmartTrialVisit} from '../models/transmart-models/transmart-trial-visit';
import {ExportDataType} from '../models/export-models/export-data-type';
import {switchMap} from 'rxjs/internal/operators';
import {TransmartMapper} from '../utilities/transmart-utilities/transmart-mapper';
import {TransmartPackerMapper} from '../utilities/transmart-utilities/transmart-packer-mapper';
import {TransmartPackerJob} from '../models/transmart-packer-models/transmart-packer-job';
import {TransmartDataTableMapper} from '../utilities/transmart-utilities/transmart-data-table-mapper';
import {DataTable} from '../models/table-models/data-table';
import {TransmartStudyDimensions} from '../models/transmart-models/transmart-study-dimensions';
import {TransmartHttpService} from './http/transmart-http.service';
import {TransmartPackerHttpService} from './http/transmart-packer-http.service';
import {Study} from '../models/constraint-models/study';
import {TransmartExportJob} from '../models/transmart-models/transmart-export-job';
import {TransmartPatient} from '../models/transmart-models/transmart-patient';
import {TransmartDimension} from '../models/transmart-models/transmart-dimension';


@Injectable({
  providedIn: 'root',
})
export class TransmartResourceService {

  static readonly SUBJECT_DIMENSION_TYPE = 'subject';

  // the export data view, for 'transmart' mode either 'dataTable' or 'surveyTable'.
  private _exportDataView: string;

  /*
   * Flag indicating if the subject selection of step 1 should be automatically
   * saved as subject set in the backend. If true, that subject set is used as the subject constraint
   * for step 2.
   */
  private _autosaveSubjectSets: boolean;
  private _useExternalExportJob: boolean;
  private _subjectSetConstraint: SubjectSetConstraint;
  private _counts: TransmartCountItem;

  constructor(private appConfig: AppConfig,
              private transmartHttpService: TransmartHttpService,
              private transmartPackerHttpService: TransmartPackerHttpService) {
    this.exportDataView = appConfig.getConfig('export-mode')['data-view'];
    this.autosaveSubjectSets = appConfig.getConfig('autosave-subject-sets');
    this.useExternalExportJob = appConfig.getConfig('export-mode')['name'] !== 'transmart';
    this.subjectSetConstraint = new SubjectSetConstraint();
    this.counts = new TransmartCountItem();
  }

  get exportDataView(): string {
    return this._exportDataView;
  }

  set exportDataView(value: string) {
    this._exportDataView = value;
  }

  get subjectSetConstraint(): SubjectSetConstraint {
    return this._subjectSetConstraint;
  }

  set subjectSetConstraint(value: SubjectSetConstraint) {
    this._subjectSetConstraint = value;
  }

  get useExternalExportJob(): boolean {
    return this._useExternalExportJob;
  }

  set useExternalExportJob(value: boolean) {
    this._useExternalExportJob = value;
  }

  get autosaveSubjectSets(): boolean {
    return this._autosaveSubjectSets;
  }

  set autosaveSubjectSets(value: boolean) {
    this._autosaveSubjectSets = value;
  }

  get counts(): TransmartCountItem {
    return this._counts;
  }

  set counts(value: TransmartCountItem) {
    this._counts = value;
  }

  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    return observableFrom(this.transmartHttpService.studies).pipe(
      map((tmStudies: TransmartStudy[]) => {
        return TransmartMapper.mapTransmartStudies(tmStudies);
      }));
  }

  /**
   * Get a specific branch of the tree nodes
   * @param {string} root - the path to the specific tree node
   * @param {number} depth - the depth of the tree we want to access
   * @param {boolean} hasCounts - whether we want to include patient and observation counts in the tree nodes
   * @param {boolean} hasTags - whether we want to include metadata in the tree nodes
   * @returns {Observable<Object>}
   */
  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    return this.transmartHttpService.getTreeNodes(root, depth, hasCounts, hasTags);
  }

  // -------------------------------------- count calls --------------------------------------
  /**
   * Update the counts in cohort selection
   * in an economical way.
   * Order of updates: study-concept-count object update -> current selection count update
   * @param {Constraint} constraint
   * @returns {Promise<any>}
   */
  updateCohortSelectionCounts(constraint: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.autosaveSubjectSets) {
        this.savePatientSet('temp', constraint)
          .subscribe((subjectSet: SubjectSet) => {
            this.subjectSetConstraint.id = subjectSet.id;
            this.subjectSetConstraint.setSize = subjectSet.setSize;
            this.updateStudyConceptCounts(this.subjectSetConstraint)
              .then(() => {
                resolve(true);
              })
              .catch(err => {
                reject(err)
              });
          }, err => {
            reject(err)
          });
      } else {
        this.updateStudyConceptCounts(constraint)
          .then(() => {
            resolve(true);
          })
          .catch(err => {
            reject(err)
          });
      }
    });
  }

  updateStudyConceptCounts(constraint: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getCountsPerStudyAndConcept(constraint)
        .subscribe((studyConceptCountObj: object) => {
          let totalCountItem: TransmartCountItem = null;
          // if in autosaveSubjectSets mode, need to calculate total observation count
          if (this.autosaveSubjectSets) {
            totalCountItem = new TransmartCountItem();
            let totalObservationCount = 0;
            for (let studyId in studyConceptCountObj) {
              let conceptCount: object = studyConceptCountObj[studyId];
              for (let conceptCode in conceptCount) {
                let countItem: TransmartCountItem = conceptCount[conceptCode];
                totalObservationCount += countItem.observationCount;
              }
            }
            totalCountItem.patientCount = this.subjectSetConstraint.setSize;
            totalCountItem.observationCount = totalObservationCount;
          }
          this.updateCounts(constraint, totalCountItem)
            .then(() => {
              resolve(true);
            })
            .catch(err => {
              reject('Fail to update transmart counts.');
            })
        }, err => {
          reject('Fail to retrieve study-concept-count object from transmart.')
        });
    });
  }

  updateCounts(constraint: Constraint, totalCountItem?: TransmartCountItem): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.autosaveSubjectSets) {
        if (!totalCountItem) {
          return reject('Missing transmart total-count item to calculate counts.');
        }
        this.counts.patientCount = totalCountItem.patientCount;
        this.counts.observationCount = totalCountItem.observationCount;
        resolve(true);
      } else {
        this.getCounts(constraint)
          .subscribe((countItem: TransmartCountItem) => {
            this.counts.patientCount = countItem.patientCount;
            this.counts.observationCount = countItem.observationCount;
            resolve(true);
          }, err => {
            reject(err);
          })
      }
    });
  }

  /**
   * Given a constraint, get the patient counts and observation counts
   * organized per study, then per concept.
   * Side benefit:
   * - can calculate total number of obervations under the given constraint
   * - if in autosaveSubjectSets mode, can retrieve the total number of subjects under the given constraint
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    return this.transmartHttpService.getCountsPerStudyAndConcept(constraint);
  }

  /**
   * Give a constraint, get the patient counts and observation counts
   * organized per study
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudy(constraint: Constraint): Observable<object> {
    return this.transmartHttpService.getCountsPerStudy(constraint);
  }

  /**
   * Give a constraint, get the patient and observation counts per concept
   * @param {Constraint} constraint
   * @returns {Observable<any>}
   */
  getCountsPerConcept(constraint: Constraint): Observable<object> {
    return this.transmartHttpService.getCountsPerConcept(constraint);
  }

  /**
   * Give a constraint, get the corresponding patient count and observation count.
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCounts(constraint: Constraint): Observable<TransmartCountItem> {
    return this.transmartHttpService.getCounts(constraint);
  }

  // -------------------------------------- aggregate calls --------------------------------------
  /**
   * Get the aggregate based on the given constraint and aggregate options,
   * the options can be {min, max, count, values, average}
   * @param {Constraint} constraint
   * @returns {Observable<object>}
   */
  getAggregate(constraint: Constraint): Observable<object> {
    return this.transmartHttpService.getAggregate(constraint);
  }

  getCategoricalAggregate(constraint: Constraint): Observable<object> {
    return this.transmartHttpService.getCategoricalAggregate(constraint);
  }

  // -------------------------------------- trial visit calls --------------------------------------
  /**
   * Given a constraint, normally a concept or a study constraint, return the corresponding trial visit list
   * @param constraint
   * @returns {Observable<R|T>}
   */
  getTrialVisits(constraint: Constraint): Observable<TransmartTrialVisit[]> {
    return this.transmartHttpService.getTrialVisits(constraint);
  }

  // -------------------------------------- pedigree calls --------------------------------------
  /**
   * Get the available pedigree relation types such as parent, child, spouse, sibling and various twin types
   * @returns {Observable<Object[]>}
   */
  getPedigrees(): Observable<Pedigree[]> {
    return this.transmartHttpService.getPedigrees();
  }

  // -------------------------------------- patient calls --------------------------------------
  /**
   * Get the patient list whose observations correspond to the given constraint
   * @param constraint
   * @returns {Observable<TransmartPatient[]>}
   */
  getPatients(constraint: Constraint): Observable<TransmartPatient[]> {
    return this.transmartHttpService.getPatients(constraint);
  }


  // -------------------------------------- export calls --------------------------------------

  getExportDataTypes(constraint: Constraint): Observable<ExportDataType[]> {
    if (this.useExternalExportJob) {
      return this.transmartPackerHttpService.getExportDataTypes()
    } else {
      return this.transmartHttpService.getExportFileFormats(this.exportDataView).pipe(
        switchMap(fileFormatNames => {
          return this.transmartHttpService.getExportDataFormats(constraint)
        }, (fileFormatNames, dataFormatNames) => {
          return TransmartMapper.mapTransmartExportFormats(fileFormatNames, dataFormatNames);
        }));
    }
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<TransmartExportJob[]>}
   */
  getExportJobs(): Observable<TransmartExportJob[]> {
    if (this.useExternalExportJob) {
      return this.transmartPackerHttpService.getAllJobs().pipe(
        map((tmExJobs: TransmartPackerJob[]) => {
          return TransmartPackerMapper.mapCustomExportJobs(tmExJobs);
        }));
    } else {
      return this.transmartHttpService.getExportJobs();
    }
  }

  /**
   * Create a new export job for the current user, with a given name
   * @param name
   * @returns {Observable<ExportJob>}
   */
  createExportJob(name: string): Observable<TransmartExportJob> {
    if (this.useExternalExportJob) {
      return this.transmartPackerHttpService.createExportJob(name);
    } else {
      return this.transmartHttpService.createExportJob(name);
    }
  }

  /**
   * Run an export job
   * @param {string} jobId
   * @param {string} jobName
   * @param {Constraint} constraint
   * @param {ExportDataType[]} dataTypes
   * @param {DataTable} dataTable
   * @param {boolean} dateColumnsIncluded
   * @returns {Observable<TransmartExportJob>}
   */
  runExportJob(jobId: string,
               jobName: string,
               constraint: Constraint,
               dataTypes: ExportDataType[],
               dataTable: DataTable,
               dateColumnsIncluded: boolean): Observable<TransmartExportJob> {
    let targetConstraint = constraint;
    if (this.autosaveSubjectSets &&
      constraint.className === 'CombinationConstraint' &&
      (<CombinationConstraint>constraint).children[1].mark === ConstraintMark.OBSERVATION) {
      let combo = new CombinationConstraint();
      combo.addChild(this.subjectSetConstraint);
      combo.addChild((<CombinationConstraint>constraint).children[1]);
      targetConstraint = combo;
    }

    if (this.useExternalExportJob) {
      return this.transmartPackerHttpService.runJob(jobName, targetConstraint).pipe(
        map((tmExJob: TransmartPackerJob) => {
          return TransmartPackerMapper.mapCustomExportJob(tmExJob);
        }));
    } else {
      const elements = TransmartMapper.mapExportDataTypes(dataTypes, this.exportDataView);
      if (this.exportDataView === 'surveyTable') {
        return this.transmartHttpService
          .runSurveyTableExportJob(jobId, targetConstraint, elements, dateColumnsIncluded);
      } else {
        const includeDataTable = elements.some(element =>
          element.dataType === 'clinical' && element.format === 'TSV'
        );
        if (includeDataTable) {
          if (dataTable.rowDimensions.length === 0 && dataTable.columnDimensions.length === 0) {
            // Data table has not been properly initialised, first fetch dimensions
            return this.getDimensions(targetConstraint).pipe(flatMap(dimensions => {
              const transmartTableState = TransmartDataTableMapper.mapStudyDimensionsToTableState(dimensions, dataTable);
              return this.transmartHttpService
                .runExportJob(jobId, targetConstraint, elements, transmartTableState);
            }));
          } else {
            const transmartTableState = TransmartDataTableMapper.mapDataTableToTableState(dataTable);
            return this.transmartHttpService
              .runExportJob(jobId, targetConstraint, elements, transmartTableState);
          }
        } else {
          return this.transmartHttpService
            .runExportJob(jobId, targetConstraint, elements, null);
        }
      }
    }
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadExportJob(jobId: string): Observable<Blob> {
    if (this.useExternalExportJob) {
      return this.transmartPackerHttpService.downloadJobData(jobId);
    } else {
      return this.transmartHttpService.downloadExportJob(jobId);
    }
  }

  /**
   * Cancels an export job with the given export job id
   * @param jobId
   * @returns {Observable<blob>}
   */
  cancelExportJob(jobId: string): Observable<{}> {
    if (this.useExternalExportJob) {
      return this.transmartPackerHttpService.cancelJob(jobId);
    } else {
      return this.transmartHttpService.cancelExportJob(jobId)
    }
  }

  /**
   * Removes an export job from the jobs table
   * @param jobId
   * @returns {Observable<blob>}
   */
  archiveExportJob(jobId: string): Observable<{}> {
    if (this.useExternalExportJob) {
      return this.transmartPackerHttpService.archiveJob(jobId);
    } else {
      return this.transmartHttpService.archiveExportJob(jobId);
    }
  }

  // -------------------------------------- patient set calls --------------------------------------
  savePatientSet(name: string, constraint: Constraint): Observable<SubjectSet> {
    return this.transmartHttpService.savePatientSet(name, constraint);
  }

  // -------------------------------------- data table ---------------------------------------------
  getDataTable(dataTable: DataTable): Observable<DataTable> {
    let offset = dataTable.offset;
    let limit = dataTable.limit;

    // Fetch dimensions for the data matching the constraint
    return this.getDimensions(dataTable.constraint).pipe(
      switchMap((transmartStudyDimensions: TransmartStudyDimensions) => {
        // Merge available dimensions and current table state
        let tableState: TransmartTableState =
          TransmartDataTableMapper.mapStudyDimensionsToTableState(transmartStudyDimensions, dataTable);
        const constraint: Constraint = dataTable.constraint;
        return this.transmartHttpService.getDataTable(tableState, constraint, offset, limit)
      }, (transmartStudyDimensions: TransmartStudyDimensions, transmartTable: TransmartDataTable) => {
        let newDataTable: DataTable = TransmartDataTableMapper.mapTransmartDataTable(transmartTable, offset, limit);
        newDataTable.constraint = dataTable.constraint;
        return newDataTable;
      }));
  }

  /**
   * Gets available dimensions for data table
   * @param {Constraint} constraint
   * @returns {Observable<TableDimension[]>}
   */
  getDimensions(constraint: Constraint): Observable<TransmartStudyDimensions> {
    // Fetch study names for the constraint
    return this.getStudyIds(constraint).pipe(
      switchMap(() => {
        // Fetch study details, including dimensions, for these studies
        return this.transmartHttpService.studies;
      }, (studyIds: string[], studies: TransmartStudy[]) => {
        if (studyIds && studies) {
          let selectedStudies = studies.filter(study => studyIds.includes(study.studyId));
          return TransmartMapper.mergeStudyDimensions(selectedStudies);
        } else {
          return new TransmartStudyDimensions();
        }
      }));
  }

  getStudyIds(constraint: Constraint): Observable<string[]> {
    return this.transmartHttpService.getStudyIds(constraint);
  }

  getCrossTable(baseConstraint: Constraint,
                rowConstraints: Constraint[],
                columnConstraints: Constraint[]): Observable<TransmartCrossTable> {
    return this.transmartHttpService.getCrossTable(baseConstraint, rowConstraints, columnConstraints);
  }

  get sortableDimensions(): Set<string> {
    return TransmartHttpService.sortableDimensions;
  }

  getSubjectDimensions(): Observable<TransmartDimension[]> {
    return this.transmartHttpService.getDimensions().pipe(
      map((transmartDimensions: TransmartDimension[]) => {
        return transmartDimensions.filter( transmartDimension =>
          transmartDimension.dimensionType &&
          transmartDimension.dimensionType.toLowerCase() === TransmartResourceService.SUBJECT_DIMENSION_TYPE);
      }));
  }

}
