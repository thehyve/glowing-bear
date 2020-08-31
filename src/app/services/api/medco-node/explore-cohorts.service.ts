/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from "@angular/core";
import { AppConfig } from "app/config/app.config";
import { ApiEndpointService } from "app/services/api-endpoint.service";
import { MedcoNetworkService } from "../medco-network.service";
import { GenomicAnnotationsService } from "../genomic-annotations.service";
import { ConstraintMappingService } from "app/services/constraint-mapping.service";
import { CryptoService } from "app/services/crypto.service";
import { ApiCohort } from "app/models/api-request-models/medco-node/api-cohort";
import { Observable, forkJoin } from "rxjs";
import { map, timeout } from "rxjs/operators";


@Injectable()
export class ExploreCohortsService{
    /**
   * Query timeout: 10 minutes.
   */
  private static TIMEOUT_MS = 1000 * 60 * 10;

  constructor(private config: AppConfig,
              private apiEndpointService: ApiEndpointService,
              private medcoNetworkService: MedcoNetworkService,
              private genomicAnnotationsService: GenomicAnnotationsService,
              private constraintMappingService: ConstraintMappingService,
              private cryptoService: CryptoService) {}

    getCohortSingleNode(nodeUrl:string):Observable<ApiCohort[]>{
        return this.apiEndpointService.getCall(
            'node/explore/cohorts',
            false,
            nodeUrl 
        ).pipe(map(x=>x))
    }
    postCohortSingleNode(nodeUrl:string,cohort:ApiCohort):Observable<any>{
        return this.apiEndpointService.postCall(
            'node/explore/cohorts',
            cohort,
            nodeUrl
        )
    }

    getCohortAllNodes():Observable<ApiCohort[][]>{
        return forkJoin( ...this.medcoNetworkService.nodesUrl.map(url =>this.getCohortSingleNode(url)))
        .pipe(timeout(ExploreCohortsService.TIMEOUT_MS))
    }

    postCohortAllNodes(cohort: ApiCohort): Observable<any>{
        return forkJoin(...this.medcoNetworkService.nodesUrl.map(url=>this.postCohortSingleNode(url,cohort)))
        .pipe(timeout(ExploreCohortsService.TIMEOUT_MS))
    }
}