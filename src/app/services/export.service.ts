import {Injectable} from '@angular/core';
import {ExportDataType} from '../models/export-models/export-data-type';
import {ConstraintService} from './constraint.service';
import {ResourceService} from './resource.service';
import {ExportJob} from '../models/export-models/export-job';
import {DataTableService} from './data-table.service';
import {MessageService} from './message.service';
import {saveAs} from 'file-saver';
import {DatePipe} from "@angular/common";

@Injectable()
export class ExportService {

  private _exportDataTypes: ExportDataType[] = [];
  private _exportJobs: ExportJob[];
  private _exportJobName: string;
  private _isLoadingExportDataTypes = false;

  constructor(private constraintService: ConstraintService,
              private resourceService: ResourceService,
              public messageService: MessageService,
              private dataTableService: DataTableService,
              private datePipe: DatePipe) {
  }

  public updateExports() {
    let combo = this.constraintService.constraint_1_2();
    // update the export info
    this.isLoadingExportDataTypes = true;
    this.resourceService.getExportDataTypes(combo)
      .subscribe(dataTypes => {
        this.exportDataTypes = dataTypes;
        this.isLoadingExportDataTypes = false;
      });
  }

  /**
   * Create the export job when the user clicks the 'Export selected sets' button
   */
  createExportJob() {
    let exportDate = this.datePipe.transform(new Date(),"yyyy-MM-dd HH.mm");
    let name = this.exportJobName ? this.exportJobName.trim() + " " + exportDate : '';

    if (this.validateExportJob(name)) {
      let summary = 'Running export job "' + name + '".';
      this.messageService.alert(summary, '', 'info');
      this.resourceService.createExportJob(name)
        .subscribe(
          newJob => {
            summary = 'Export job "' + name + '" is created.';
            this.messageService.alert(summary, '', 'success');
            this.exportJobName = '';
            this.runExportJob(newJob);
          },
          err => console.error(err)
        );
    }
  }

  /**
   * Run the just created export job
   * @param job
   */
  public runExportJob(job: ExportJob) {
    let constraint = this.constraintService.constraint_1_2();
    this.resourceService.runExportJob(job, this.exportDataTypes, constraint, this.dataTableService.dataTable)
      .subscribe(
        returnedExportJob => {
          if (returnedExportJob) {
            this.updateExportJobs();
          }
        },
        err => this.resourceService.handleError(err)
      );
  }

  /**
   * When an export job's status is 'completed', the user can click the Download button,
   * then the files of that job can be downloaded
   * @param job
   */
  downloadExportJob(job) {
    job.isInDisabledState = true;
    this.resourceService.downloadExportJob(job.id)
      .subscribe(
        (data) => {
          let blob = new Blob([data], {type: 'application/zip'});
          saveAs(blob, `${job.jobName}.zip`, true);
        },
        err => console.error(err),
        () => {
        }
      );
  }

  cancelExportJob(job) {
    job.isInDisabledState = true;
    this.resourceService.cancelExportJob(job.id)
      .subscribe(
        response => {
          this.updateExportJobs();
        },
        err => console.error(err)
      );
  }

  archiveExportJob(job) {
    job.isInDisabledState = true;
    this.resourceService.archiveExportJob(job.id)
      .subscribe(
        response => {
          this.updateExportJobs();
        },
        err => console.error(err)
      );
  }

  updateExportJobs() {
    this.resourceService.getExportJobs()
      .subscribe(
        jobs => {
          jobs.forEach(job => {
            job.isInDisabledState = false
          });
          this.exportJobs = jobs;
        },
        err => console.error(err)
      );
  }

  /**
   * Validate a new exportJob
   * @param {string} name
   * @returns {boolean}
   */
  private validateExportJob(name: string): boolean {
    let validName = name !== '';

    // 1. Validate if job name is specified
    if (!validName) {
      const summary = 'Please specify the job name.';
      this.messageService.alert(summary, '', 'warn');
      return false;
    }

    // 2. Validate if job name is not duplicated
    for (let job of this.exportJobs) {
      if (job['jobName'] === name) {
        const summary = 'Duplicate job name, choose a new name.';
        this.messageService.alert(summary, '', 'warn');
        return false;
      }
    }

    // 3. Validate if at least one data type is selected
    if (!this.exportDataTypes.some(ef => ef['checked'] === true)) {
      const summary = 'Please select at least one data type.';
      this.messageService.alert(summary, '', 'warn');
      return false;
    }

    // 4. Validate if at least one file format is selected for checked data formats
    for (let dataFormat of this.exportDataTypes) {
      if (dataFormat['checked'] === true) {
        if (!dataFormat['fileFormats'].some(ff => ff['checked'] === true)) {
          const summary = 'Please select at least one file format for ' + dataFormat['name'] + ' data format.';
          this.messageService.alert(summary, '', 'warn');
          return false;
        }
      }
    }

    // 5. Validate if at least one observation is included
    // TODO: refactor this, while avoiding cyclic dependencies between expoert service and query service
    // if (this.queryService.observationCount_2 < 1) {
    //   const summary = 'No observation included to be exported.';
    //   this.messageService.alert(summary, '', 'warn');
    //   return false;
    // }

    return true;
  }

  get exportDataTypes(): ExportDataType[] {
    return this._exportDataTypes;
  }

  set exportDataTypes(value: ExportDataType[]) {
    this._exportDataTypes = value;
  }

  get isLoadingExportDataTypes(): boolean {
    return this._isLoadingExportDataTypes;
  }

  set isLoadingExportDataTypes(value: boolean) {
    this._isLoadingExportDataTypes = value;
  }

  get exportJobs(): ExportJob[] {
    return this._exportJobs;
  }

  set exportJobs(value: ExportJob[]) {
    this._exportJobs = value;
  }

  get exportJobName(): string {
    return this._exportJobName;
  }

  set exportJobName(value: string) {
    this._exportJobName = value;
  }
}
