export class ExportJob {
  private _id: string;
  private _jobName: string;
  private _jobStatus: string;
  private _jobStatusTime: string;
  private _userId: string;
  private _viewerURL: string;
  private _isInDisabledState: boolean;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get jobName(): string {
    return this._jobName;
  }

  set jobName(value: string) {
    this._jobName = value;
  }

  get jobStatus(): string {
    return this._jobStatus;
  }

  set jobStatus(value: string) {
    this._jobStatus = value;
  }

  get jobStatusTime(): string {
    return this._jobStatusTime;
  }

  set jobStatusTime(value: string) {
    this._jobStatusTime = value;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(value: string) {
    this._userId = value;
  }

  get viewerURL(): string {
    return this._viewerURL;
  }

  set viewerURL(value: string) {
    this._viewerURL = value;
  }

  get isInDisabledState(): boolean {
    return this._isInDisabledState;
  }

  set isInDisabledState(value: boolean) {
    this._isInDisabledState = value;
  }
}
