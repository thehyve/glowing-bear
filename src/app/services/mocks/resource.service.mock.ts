import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/study';
import {ExportJob} from '../../models/export-job';

export class ResourceServiceMock {
  private studies: Study[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];

  constructor() {
    this.studies = [];
    this.treeNodes = [];
    this.exportJobs = [];
  }

  getStudies(): Observable<Study[]> {
    return Observable.of(this.studies);
  }

  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    return Observable.of(this.treeNodes);
  }

  getExportJobs(): Observable<ExportJob[]> {
    return Observable.of(this.exportJobs);
  }
}
