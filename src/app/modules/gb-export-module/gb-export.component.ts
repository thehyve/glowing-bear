import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../services/constraint.service';
import {ResourceService} from '../../services/resource.service';
import {SimpleTimer} from 'ng2-simple-timer';
import {ExportJob} from '../../models/export-models/export-job';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {saveAs} from 'file-saver';
import {QueryService} from '../../services/query.service';
import {TableService} from '../../services/table.service';
import {AppConfig} from '../../config/app.config';
import {ExportService} from '../../services/export.service';
import {ExportDataType} from '../../models/export-models/export-data-type';

@Component({
  selector: 'gb-export',
  templateUrl: './gb-export.component.html',
  styleUrls: ['./gb-export.component.css']
})
export class GbExportComponent implements OnInit {

  constructor(private appConfig: AppConfig,
              private exportService: ExportService,
              public resourceService: ResourceService,
              private timer: SimpleTimer) {
    this.exportService.updateExportJobs();
    this.timer.newTimer('30sec', 30);
    this.timer.subscribe('30sec', () => this.exportService.updateExportJobs());
  }

  ngOnInit() {
  }

  createExportJob() {
    this.exportService.createExportJob();
  }

  onExportJobNameInputDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  get exportJobName(): string {
    return this.exportService.exportJobName;
  }

  set exportJobName(value: string) {
    this.exportService.exportJobName = value;
  }

  get isTransmartEnv(): boolean {
    let env = this.appConfig.getEnv();
    return (env === 'default') || (env === 'transmart');
  }

  get exportDataTypes(): ExportDataType[] {
    return this.exportService.exportDataTypes;
  }

  get exportJobs(): ExportJob[] {
    return this.exportService.exportJobs;
  }

  get isLoadingExportDataTypes(): boolean {
    return this.exportService.isLoadingExportDataTypes;
  }
}
