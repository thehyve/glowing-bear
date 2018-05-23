import {ExportDataType} from '../../models/export-models/export-data-type';
import {ExportJob} from '../../models/export-models/export-job';

export class ExportServiceMock {
  private _exportDataTypes: ExportDataType[] = [];
  private _exportJobs: ExportJob[];
  private _exportJobName: string;
  private _isLoadingExportDataTypes = false;


  updateExportJobs() {
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
