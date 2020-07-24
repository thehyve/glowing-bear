import { Injectable } from "@angular/core";
import { AppConfig } from "app/config/app.config";
import { ApiEndpointService } from "app/services/api-endpoint.service";
import { MedcoNetworkService } from "../medco-network.service";
import { GenomicAnnotationsService } from "../genomic-annotations.service";
import { ConstraintMappingService } from "app/services/constraint-mapping.service";
import { CryptoService } from "app/services/crypto.service";
import { ApiCohorts } from "app/models/api-request-models/medco-node/api-cohorts";
import { Observable, forkJoin } from "rxjs";
import { map, timeout } from "rxjs/operators";
import { fork } from "child_process";

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

    getCohortSingleNode(nodeUrl:string):Observable<ApiCohorts[]>{
        return this.apiEndpointService.getCall(
            'node/explore/cohorts',
            null,
            nodeUrl 
        ).pipe(map(x=>x))
    }
    postCohortSingleNode(nodeUrl:string,cohort:ApiCohorts):Observable<any>{
        return this.apiEndpointService.postCall(
            'node/explore/cohorts',
            cohort,
            nodeUrl
        )
    }

    getCohortAllNodes(){
        return forkJoin( ...this.medcoNetworkService.nodesUrl.map(url =>this.getCohortSingleNode(url)))
        .pipe(timeout(ExploreCohortsService.TIMEOUT_MS))
    }

    postCohortAllNodes(cohort: ApiCohorts): Observable<any>{
        return forkJoin(...this.medcoNetworkService.nodesUrl.map(url=>this.postCohortSingleNode(url,cohort)))
        .pipe(timeout(ExploreCohortsService.TIMEOUT_MS))
    }
}