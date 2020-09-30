/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { ApiEndpointService } from '../../api-endpoint.service';
import { MedcoNetworkService } from '../medco-network.service';

import { CryptoService } from '../../crypto.service';
import { Observable, forkJoin } from 'rxjs';
import { ApiCohort } from 'app/models/api-request-models/medco-node/api-cohort';
import { map, timeout } from 'rxjs/operators';
import { ApiSurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';
import { ApiSurvivalAnalysisResponse } from 'app/models/api-request-models/survival-analyis/survival-analysis-response';

@Injectable()
export class SurvivalAnalysisService {

  /**
  * Query timeout: 10 minutes.
  */
  private static TIMEOUT_MS = 1000 * 60 * 10;

  constructor(private apiEndpointService: ApiEndpointService,
              private medcoNetworkService: MedcoNetworkService,
              private cryptoService: CryptoService) { }

  survivalAnalysisSingleNode(nodeUrl: string, apiSurvivalAnalysis: ApiSurvivalAnalysis): Observable<ApiSurvivalAnalysisResponse> {
    console.log(apiSurvivalAnalysis)
    return this.apiEndpointService.postCall(
      '/node/analysis/survival/query',
      apiSurvivalAnalysis,
      nodeUrl
    ).pipe(map(x => x))
  }


  survivalAnalysisAllNodes(apiSurvivalAnalysis: ApiSurvivalAnalysis, patientSetIDs: Array<number>): Observable<ApiSurvivalAnalysisResponse[]> {
    apiSurvivalAnalysis.userPublicKey = this.cryptoService.ephemeralPublicKey
    return forkJoin(...this.medcoNetworkService.nodesUrl.map(
      (url, index) => {
        console.log('patientSet', patientSetIDs)
        apiSurvivalAnalysis.setID = patientSetIDs[index]
        return this.survivalAnalysisSingleNode(url, apiSurvivalAnalysis)
      }
    ))
      .pipe(timeout(SurvivalAnalysisService.TIMEOUT_MS))
  }
}
