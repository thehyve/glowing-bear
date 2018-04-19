import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/constraint-models/study';
import {Constraint} from '../../models/constraint-models/constraint';
import {PedigreeRelationTypeResponse} from '../../models/constraint-models/pedigree-relation-type-response';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {ExportJob} from '../../models/export-job';
import {Query} from '../../models/query-models/query';
import {PatientSet} from '../../models/constraint-models/patient-set';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartQuery} from '../../models/transmart-models/transmart-query';
import {TransmartStudyDimensionElement} from 'app/models/transmart-models/transmart-study-dimension-element';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {AppConfig} from 'app/config/app.config';
import {IRCTResourceDef} from '../../models/irct-models/irct-resource-definition';

@Injectable()
export class IRCTEndPointServiceMock {

  private irctResources: IRCTResourceDef[];


  constructor() {
    this.irctResources = [];
  }

  getIRCTResources(): Observable<IRCTResourceDef[]> {
    return Observable.of(this.irctResources);
  }
}
