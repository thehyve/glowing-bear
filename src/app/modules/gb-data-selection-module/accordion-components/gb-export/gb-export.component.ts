import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {ResourceService} from '../../../../services/resource.service';
import {SimpleTimer} from 'ng2-simple-timer';
import {Response} from '@angular/http';
import {ExportJob} from '../../../../models/export-job';
import {CombinationConstraint} from '../../../../models/constraints/combination-constraint';

@Component({
  selector: 'gb-export',
  templateUrl: './gb-export.component.html',
  styleUrls: ['./gb-export.component.css']
})
export class GbExportComponent implements OnInit {

  exportJobs: ExportJob[];
  exportJobName: string;

  constructor(private constraintService: ConstraintService,
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
          console.log('jobs, ', jobs);
          this.exportJobs = jobs;
        },
        err => console.error(err)
      );
  }

  /**
   * Create the export job when the user clicks the 'Export selected sets' button
   */
  createExportJob() {
    let name = this.exportJobName ? this.exportJobName.trim() : undefined;
    let duplicateName = false;
    for (let job of this.exportJobs) {
      if (job['jobName'] === name) {
        duplicateName = true;
        break;
      }
    }

    if (duplicateName) {
      const summary = 'Duplicate job name, choose a new name.';
      this.constraintService.alert(summary, '', 'warn');
    } else {
      let summary = 'Running export job "' + name + '".';
      this.constraintService.alert(summary, '', 'info');
      this.resourceService.createExportJob(name)
        .subscribe(
          newJob => {
            summary = 'Export job "' + name + '" is created.';
            this.constraintService.alert(summary, '', 'success');
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
              format: fileFormat['name']
            });
          }
        }
      }
    }
    if (elements.length > 0) {
      const selectionConstraint = this.constraintService.getSelectionConstraint();
      const projectionConstraint = this.constraintService.getProjectionConstraint();
      let combo = new CombinationConstraint();
      combo.children.push(selectionConstraint);
      combo.children.push(projectionConstraint);

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
    this.resourceService.downloadExportJob(job.id)
      .subscribe(
        (response: Response) => {
          let blob = new Blob([response.blob()], {type: 'application/zip'});
          /*
           * The document anchor click approach
           * Alternative: The file-saver approach: FileSaver.saveAs(blob, `${job.jobName}.zip`);
           */
          let url = window.URL.createObjectURL(blob);
          let anchor = document.createElement('a');
          anchor.download = `${job.jobName}.zip`;
          anchor.href = url;
          anchor.click();
          anchor.remove();
        },
        err => console.error(err),
        () => {
        }
      );
  }

  onExportJobNameInputDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  get isLoadingExportFormats(): boolean {
    return this.constraintService.isLoadingExportFormats;
  }

  get exportFormats(): object[] {
    return this.constraintService.exportFormats;
  }

}
