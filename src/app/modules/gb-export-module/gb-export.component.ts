import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {SimpleTimer} from 'ng2-simple-timer';
import {ExportJob} from '../../models/export-models/export-job';
import {AppConfig} from '../../config/app.config';
import {ExportService} from '../../services/export.service';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {MessageService} from '../../services/message.service';

@Component({
  selector: 'gb-export',
  templateUrl: './gb-export.component.html',
  styleUrls: ['./gb-export.component.css']
})
export class GbExportComponent implements OnInit {

  constructor(private appConfig: AppConfig,
              private exportService: ExportService,
              public resourceService: ResourceService,
              private timer: SimpleTimer,
              public messageService: MessageService) {
    this.exportService.updateExportJobs();
    this.timer.newTimer('30sec', 30);
    this.timer.subscribe('30sec', () => this.exportService.updateExportJobs());
  }

  ngOnInit() {
  }

  createExportJob() {
    this.exportService.createExportJob();
  }

  downloadExportJob(job) {
    this.exportService.downloadExportJob(job);
  }

  cancelExportJob(job) {
    this.exportService.cancelExportJob(job);
  }

  archiveExportJob(job) {
    this.exportService.archiveExportJob(job)
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
