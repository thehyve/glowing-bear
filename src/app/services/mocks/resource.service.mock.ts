import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/study';
import {PatientSet} from '../../models/patient-set';
import {ExportJob} from '../../models/export-job';

export class ResourceServiceMock {
  private studies: Study[];
  private treeNodes: object[];
  private patientSets: PatientSet[];
  private exportJobs: ExportJob[];

  constructor() {
    this.studies = [];
    this.treeNodes = [];
    this.patientSets = [];
    this.exportJobs = [];
  }

  getStudies(): Observable<Study[]> {
    return Observable.of(this.studies);
  }

  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    return Observable.of(this.treeNodes);
  }

  getPatientSets(): Observable<PatientSet[]> {
    return Observable.of(this.patientSets);
  }

  getExportJobs(): Observable<ExportJob[]> {
    return Observable.of(this.exportJobs);
  }
}
