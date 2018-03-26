import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {ResourceService} from '../../../../services/resource.service';
import {SimpleTimer} from 'ng2-simple-timer';
import {ExportJob} from '../../../../models/export-job';
import {CombinationConstraint} from '../../../../models/constraint-models/combination-constraint';
import {saveAs} from 'file-saver';
import {QueryService} from '../../../../services/query.service';

@Component({
  selector: 'gb-export',
  templateUrl: './gb-export.component.html',
  styleUrls: ['./gb-export.component.css']
})
export class GbExportComponent implements OnInit {

  exportJobs: ExportJob[];
  exportJobName: string;
  dateColumnsIncluded: boolean;
  exportDataView: string;

  constructor(private constraintService: ConstraintService,
              private queryService: QueryService,
              private resourceService: ResourceService,
              private timer: SimpleTimer) {
    this.updateExportJobs();
    this.timer.newTimer('30sec', 30);
    this.timer.subscribe('30sec', () => this.updateExportJobs());
    this.dateColumnsIncluded = true;
    this.exportDataView = queryService.exportDataView;
  }

  ngOnInit() {
  }

  updateExportJobs() {
    this.resourceService.getExportJobs()
      .subscribe(
        jobs => {
          jobs.forEach(job => {job.isInDisabledState = false});
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
      this.queryService.alert(summary, '', 'warn');
      return false;
    }

    // 2. Validate if job name is not duplicated
    for (let job of this.exportJobs) {
      if (job['jobName'] === name) {
        const summary = 'Duplicate job name, choose a new name.';
        this.queryService.alert(summary, '', 'warn');
        return false;
      }
    }

    // 3. Validate if at least one data type is selected
    if (!this.exportFormats.some(ef => ef['checked'] === true)) {
      const summary = 'Please select at least one data type.';
      this.queryService.alert(summary, '', 'warn');
      return false;
    }

    // 4. Validate if at least one file format is selected for checked data formats
    for (let dataFormat of this.exportFormats) {
      if (dataFormat['checked'] === true) {
        if (!dataFormat['fileFormats'].some(ff => ff['checked'] === true)) {
          const summary = 'Please select at least one file format for ' + dataFormat['name'] + ' data format.';
          this.queryService.alert(summary, '', 'warn');
          return false;
        }
      }
    }

    // 5. Validate if at least one observation is included
    if (this.queryService.observationCount_2 < 1) {
      const summary = 'No observation included to be exported.';
      this.queryService.alert(summary, '', 'warn');
      return false;
    }

    return true;
  }

  /**
   * Create the export job when the user clicks the 'Export selected sets' button
   */
  createExportJob() {
    let name = this.exportJobName ? this.exportJobName.trim() : '';

    if (this.validateExportJob(name)) {
      let summary = 'Running export job "' + name + '".';
      this.queryService.alert(summary, '', 'info');
      this.resourceService.createExportJob(name)
        .subscribe(
          newJob => {
            summary = 'Export job "' + name + '" is created.';
            this.queryService.alert(summary, '', 'success');
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
  runExportJob(job) {
    let jobId = job['id'];
    let elements: object[] = [];
    for (let dataFormat of this.exportFormats) {
      if (dataFormat['checked']) {
        for (let fileFormat of dataFormat['fileFormats']) {
          if (fileFormat['checked']) {
            elements.push({
              dataType: dataFormat['name'],
              format: fileFormat['name'],
              dataView: this.queryService.exportDataView
            });
          }
        }
      }
    }
    if (elements.length > 0) {
      const selectionConstraint = this.queryService.patientSet_1 ?
          this.queryService.patientSet_1 : this.constraintService.generateSelectionConstraint();
      const projectionConstraint = this.constraintService.generateProjectionConstraint();
      let combo = new CombinationConstraint();
      combo.addChild(selectionConstraint);
      combo.addChild(projectionConstraint);

      this.resourceService.runExportJob(jobId, combo, elements, this.dateColumnsIncluded)
        .subscribe(
          returnedExportJob => {
            this.updateExportJobs();
          },
          err => console.error(err)
        );
    }
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

  onExportJobNameInputDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  get isLoadingExportFormats(): boolean {
    return this.queryService.isLoadingExportFormats;
  }

  get exportFormats(): object[] {
    return this.queryService.exportFormats;
  }

}
