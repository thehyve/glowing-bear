import {Injectable} from '@angular/core';
import {AppConfig} from '../../../config/app.config';
import {Observable, forkJoin, of} from 'rxjs';
import {timeout, switchMap} from "rxjs/operators";
import {I2b2Panel} from '../../../models/api-request-models/medco-node/i2b2-panel';
import {Constraint} from '../../../models/constraint-models/constraint';
import {ConstraintMappingService} from '../../constraint-mapping.service';
import {ApiEndpointService} from '../../api-endpoint.service';
import {GenomicAnnotationsService} from "../genomic-annotations.service";
import {ExploreQueryResult} from "../../../models/api-response-models/medco-node/explore-query-result";
import {AuthenticationService} from "../../authentication/authentication.service";
import {ExploreQueryType} from "../../../models/query-models/explore-query-type";
import {MedcoNetworkService} from "../medco-network.service";
import {ExploreQuery} from "../../../models/query-models/explore-query";

@Injectable()
export class ExploreQueryService {

  /**
   * Query timeout: 10 minutes.
   */
  private static QUERY_TIMEOUT_MS = 1000*60*10;

  constructor(private config: AppConfig,
              private apiEndpointService: ApiEndpointService,
              private medcoNetworkService: MedcoNetworkService,
              private genomicAnnotationsService: GenomicAnnotationsService,
              private constraintMappingService: ConstraintMappingService,
              private authenticationService: AuthenticationService) { }

  //  ------------------- api calls ----------------------

  /**
   * @returns {Observable<number>} the resultId
   * @param queryId
   * @param queryType
   * @param userPublicKey
   * @param panels
   * @param nodeUrl
   * @param sync
   */
  private exploreQuerySingleNode(queryId: string, queryType: ExploreQueryType, userPublicKey: string, panels: I2b2Panel[], nodeUrl: string, sync: boolean = true): Observable<ExploreQueryResult> {
    return this.apiEndpointService.postCall(
      "node/explore/query?sync=" + sync,
      {
        id: queryId,
        query: {
          type: queryType.id,
          userPublicKey: userPublicKey,
          panels: panels
        }
      }
    );
  }

  // -------------------------------------- helper calls --------------------------------------

  /**
   * Execute simultaneously the specified MedCo query on all the nodes.
   * Ensures before execute that the token is still valid.
   *
   * @param queryId
   * @param queryType
   * @param userPublicKey
   * @param panels
   */
  private exploreQueryAllNodes(queryId: string, queryType: ExploreQueryType, userPublicKey: string, panels: I2b2Panel[]): Observable<ExploreQueryResult[]> {
    return this.authenticationService.authorise().pipe(switchMap(() =>
      forkJoin(...this.medcoNetworkService.nodesUrl.map(
        (url) => this.exploreQuerySingleNode(queryId, queryType, userPublicKey, panels, url)
      )).pipe(
        timeout(ExploreQueryService.QUERY_TIMEOUT_MS))
    ));
  }

  /**
   *
   * @param query
   */
  exploreQuery(query: ExploreQuery): Observable<ExploreQueryResult[]> {
    if (query.constraint.className === 'TrueConstraint') {
      return of([]);
    } else if (query.constraint.className !== 'CombinationConstraint') {
      throw new Error('Only root constraint accepted.');
    }

    return this.exploreQueryAllNodes(
        query.uniqueId,
        query.type,
        this.medcoNetworkService.networkPubKey,
        this.constraintMappingService.mapConstraint(query.constraint)
    );
  }

  //  ------------------- private ----------------------

  /**
   * Parse the MedCo results coming from PIC-SURE, themselves coming from the MedCo cells.
   * Stores the breakdown by hospital and the other information.
   * Make available the "MedCo Results" tab in UI.
   *
   * @returns {number} the total number of matching patients.
   * @param results
   */
  // private parseResults(results: ExploreQueryResult[]): number {
  //
  //   for (let k in results) {
  //
  //     if (this.publicKey !== results[k].encryptionKey) {
  //       console.warn(`Returned public key is different from public key, expect problems (${results[k].encryptionKey})`);
  //     }
  //
  //     results[k].nodeName = `Clinical Site ${k}`; // todo: get from node
  //     results[k].networkName = 'MedCo Network'; // todo: get from node
  //     results[k].timeMeasurements = {}; // todo
  //
  //     // decrypt count
  //     results[k].decryptedCount = Number(this.decryptInteger(results[k].encryptedCount));
  //
  //     // decrypt patient list, ignore IDs that are zero (= dummies nullified)
  //     results[k].decryptedPatientList = results[k].encryptedPatientList?
  //       results[k].encryptedPatientList
  //         .map((encId) => Number(this.decryptInteger(encId)))
  //         .filter((pId) => pId !== 0):
  //       [];
  //
  //     // parse query type
  //     results[k].parsedQueryType = QueryType.ALL_TYPES.find((type) => type.id === results[k].queryType);
  //
  //     console.log(`${k}: count=${results[k].decryptedCount}, #patient IDs=${results[k].decryptedPatientList.length}, times: ${JSON.stringify(results[k].timeMeasurements)}`)
  //   }
  //
  //   // randomize results (according to configuration)
  //   let medcoResultsRandomization = this.config.getConfig('medco-results-randomization');
  //   if (medcoResultsRandomization) {
  //     results.forEach((res) =>
  //       res.decryptedCount += Math.floor(Math.random() * Number(medcoResultsRandomization))
  //     );
  //   }
  //
  //   this.results.next(results);
  //
  //   if (results[0].parsedQueryType === QueryType.COUNT_GLOBAL ||
  //     results[0].parsedQueryType === QueryType.COUNT_GLOBAL_OBFUSCATED) {
  //     // count is global: all results should be the same, return the first one
  //     return results[0].decryptedCount;
  //   } else {
  //     this.addMedcoResultsTab();
  //     return results.map((r) => r.decryptedCount).reduce((a, b) => Number(a) + Number(b));
  //   }
  // }

  /**
   * Periodically poll status of result and wait until it is available, or if an error happen.
   * return result if available, null if problem
   *
   * @param {number} resultId
   * @returns {Observable<boolean>} true if result is available, false if error or timeout
   */
  // todo: use for async query implementation
  // waitOnResult(resultId: number): Observable<object> {
  //   return Observable
  //     .interval(1000)
  //     .flatMap(() => this.getResultStatus(resultId))
  //     .do((resultStatus) => console.log(`Result ${resultId} is ${resultStatus['status']}`))
  //     .filter((resultStatus) => resultStatus['status'] === 'AVAILABLE' || resultStatus['status'] === 'ERROR')
  //     .take(1)
  //     .flatMap((resultStatus) => resultStatus['status'] === 'AVAILABLE' ?
  //       this.getResult(resultId) :
  //       Observable.throw(`Error of result ${resultId}: ${resultStatus['message']}`))
  //     .timeout(60000);
  // }
}
