import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {ResourceService} from '../../../../services/resource.service';
import {SimpleTimer} from 'ng2-simple-timer';
import {Response} from '@angular/http';
import {ExportJob} from '../../../../models/export-job';
import {CombinationConstraint} from '../../../../models/constraints/combination-constraint';
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

  constructor(private constraintService: ConstraintService,
              private queryService: QueryService,
              private resourceService: ResourceService,
              private timer: SimpleTimer) {
    this.updateExportJobs();
    this.timer.newTimer('30sec', 30);
    this.timer.subscribe('30sec', () => this.updateExportJobs());
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
   * Create the export job when the user clicks the 'Export selected sets' button
   */
  createExportJob() {
    let name = this.exportJobName ? this.exportJobName.trim() : '';
    let validName = name !== '';
    let duplicateName = false;

    if(!validName) {
      const summary = 'Please specify the job name.';
      this.queryService.alert(summary, '', 'warn');
    } else {

      for (let job of this.exportJobs) {
        if (job['jobName'] === name) {
          duplicateName = true;
          break;
        }
      }

      if (duplicateName) {
        const summary = 'Duplicate job name, choose a new name.';
        this.queryService.alert(summary, '', 'warn');
      } else {
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

      this.resourceService.runExportJob(jobId, combo, elements)
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
        (response: Response) => {
          let blob = new Blob([response.blob()], {type: 'application/zip'});
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
