import { Injectable } from '@angular/core';
import { ApiEndpointService } from '../api-endpoint.service';
import { MedcoNetworkService } from './medco-network.service';

import { CryptoService } from '../crypto.service';
import { Observable, forkJoin } from 'rxjs';
import { ApiCohorts } from 'app/models/api-request-models/medco-node/api-cohorts';
import { map, timeout } from 'rxjs/operators';
import { ApiSurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';

@Injectable()
export class SurvivalAnalysisService {

   /**
   * Query timeout: 10 minutes.
   */
  private static TIMEOUT_MS = 1000 * 60 * 10;

  constructor(
              private apiEndpointService: ApiEndpointService,
              private medcoNetworkService: MedcoNetworkService,
              private cryptoService: CryptoService) {}

    survivalAnalysisSingleNode(nodeUrl:string,apiSurvivalAnalysis:ApiSurvivalAnalysis):Observable<ApiCohorts[]>{
        return this.apiEndpointService.postCall(
            'survival-analysis',
            apiSurvivalAnalysis,
            nodeUrl 
        ).pipe(map(x=>x))
    }


    survivalAnalysisAllNodes(apiSurvivalAnalysis:ApiSurvivalAnalysis,cohortResultInstanceID:Map<string,number>): Observable<any>{
        return forkJoin(...this.medcoNetworkService.nodesUrl.map(
          url=>{
            apiSurvivalAnalysis.patientGroupID=cohortResultInstanceID[url]
            return this.survivalAnalysisSingleNode(url,apiSurvivalAnalysis)
          }
          ))
        .pipe(timeout(SurvivalAnalysisService.TIMEOUT_MS))
    }
}
