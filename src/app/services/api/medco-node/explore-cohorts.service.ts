/**
 * Copyright 2020 - 2021 CHUV
 * Copyright 2020 - 2021 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { AppConfig } from 'app/config/app.config';
import { ApiEndpointService } from 'app/services/api-endpoint.service';
import { MedcoNetworkService } from '../medco-network.service';
import { GenomicAnnotationsService } from '../genomic-annotations.service';
import { ConstraintMappingService } from 'app/services/constraint-mapping.service';
import { CryptoService } from 'app/services/crypto.service';
import { ApiCohort } from 'app/models/api-request-models/medco-node/api-cohort';
import { Observable, forkJoin } from 'rxjs';
import { map, timeout } from 'rxjs/operators';

import { ApiCohortResponse } from 'app/models/api-response-models/medco-node/api-cohort-response';
import { ApiCohortsPatientLists } from 'app/models/api-request-models/medco-node/api-cohorts-patient-lists';
import { ApiCohortsPatientListsResponse } from 'app/models/api-response-models/medco-node/api-cohorts-patient-list-response';
import {ApiNodeMetadata} from '../../../models/api-response-models/medco-network/api-node-metadata';


@Injectable()
export class ExploreCohortsService {

  /**
   * Query timeout: 10 minutes.
   */
  private static TIMEOUT_MS = 1000 * 60 * 10;

  constructor(private config: AppConfig, private apiEndpointService: ApiEndpointService,
              private medcoNetworkService: MedcoNetworkService) { }

  getCohortSingleNode(node: ApiNodeMetadata): Observable<ApiCohortResponse[]> {
    return this.apiEndpointService.getCall(
      'node/explore/cohorts',
      false,
      node.url
    );
  }

  postCohortSingleNode(node: ApiNodeMetadata, cohortName: string, cohort: ApiCohort): Observable<string> {
    return this.apiEndpointService.postCall(
      `node/explore/cohorts/${cohortName}`,
      cohort,
      node.url
    );
  }

  removeCohortSingleNode(node: ApiNodeMetadata, cohortName: string) {

    return this.apiEndpointService.deleteCall(
      `node/explore/cohorts/${cohortName}`,
      node.url
    );
  }

  postCohortsPatientListSingleNode(node: ApiNodeMetadata, cohortPatientListRequest: ApiCohortsPatientLists):
    Observable<[ApiNodeMetadata, ApiCohortsPatientListsResponse]> {

    return this.apiEndpointService.postCall(
      'node/explore/cohorts/patient-list',
      cohortPatientListRequest,
      node.url
    ).pipe(map((resp) => [node, resp]));
  }


  getCohortAllNodes(): Observable<ApiCohortResponse[][]> {
    return forkJoin(this.medcoNetworkService.nodes.map(node => this.getCohortSingleNode(node)))
      .pipe(timeout(ExploreCohortsService.TIMEOUT_MS))
  }

  postCohortAllNodes(cohortName: string, cohort: ApiCohort[]): Observable<string[]> {
    return forkJoin(this.medcoNetworkService.nodes.map((node, index) => this.postCohortSingleNode(node, cohortName, cohort[index])))
      .pipe(timeout(ExploreCohortsService.TIMEOUT_MS))
  }

  removeCohortAllNodes(cohortName: string) {
    return forkJoin(this.medcoNetworkService.nodes.map(node => this.removeCohortSingleNode(node, cohortName)))
      .pipe(timeout(ExploreCohortsService.TIMEOUT_MS))
  }

  postCohortsPatientListAllNodes(cohortPatientListRequest: ApiCohortsPatientLists):
    Observable<[ApiNodeMetadata, ApiCohortsPatientListsResponse][]> {

    return forkJoin(this.medcoNetworkService.nodes.map(node => this.postCohortsPatientListSingleNode(node, cohortPatientListRequest)))
      .pipe(timeout((ExploreCohortsService.TIMEOUT_MS)))
  }
}
