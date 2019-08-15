import {Injectable} from '@angular/core';
import {PicsureResource} from '../../models/picsure-models/picsure-resource';
import {AppConfig} from '../../config/app.config';
import {Observable} from 'rxjs/Observable';
import {I2b2Panel} from '../../models/picsure-models/i2b2-medco/i2b2-panel';
import {Aggregate} from '../../models/aggregate-models/aggregate';
import {Constraint} from '../../models/constraint-models/constraint';
import {TreeNode} from '../../models/tree-models/tree-node';
import {PicsureMappingService} from './picsure-mapping-service';
import {ApiEndpointService} from '../api-endpoint.service';
import {ConceptType} from '../../models/constraint-models/concept-type';
import {TreeNodeType} from '../../models/tree-models/tree-node-type';
import {Concept} from '../../models/constraint-models/concept';
import {CountItem} from '../../models/aggregate-models/count-item';
import {MedcoService} from './medco.service';
import {GenomicAnnotationsService} from "./genomic-annotations.service";
import {ResourceCredentials} from "../../models/picsure-models/resource-credentials";
import {MedcoNodeResult} from "../../models/picsure-models/i2b2-medco/medco-node-result";
import {AuthenticationService} from "../authentication/authentication.service";
import {MedcoQueryType} from "../../models/picsure-models/i2b2-medco/medco-query-type";
import {QueryService} from "../query.service";

@Injectable()
export class PicSureResourceService {

  /**
   * Contains the PICSURE resources currently used by Glowing Bear for ontology search.
   */
  private _searchResource: PicsureResource;

  /**
   * Contains the PICSURE resources currently used by Glowing Bear for query.
   */
  private _queryResources: PicsureResource[];

  /**
   * List of resources declared by the backend.
   */
  private _allResources: PicsureResource[];

  /**
   * Query timeout: 10 minutes.
   */
  private static QUERY_TIMEOUT_MS = 1000*60*10;

  initialized: Observable<boolean>;

  constructor(private config: AppConfig,
              private apiEndpointService: ApiEndpointService,
              private medcoService: MedcoService,
              private genomicAnnotationsService: GenomicAnnotationsService,
              private picsureMappingService: PicsureMappingService,
              private authenticationService: AuthenticationService) {
    this.initialized = this.loadResources(
      this.config.getConfig('picsure-search-resource-name'),
      this.config.getConfig('picsure-query-resource-names')
    ).shareReplay(1);
  }

  init() {
    this.initialized.subscribe();
  }

  private loadResources(searchResName: string, queryResNames: string[]) {
    return this.getPicsureResources().switchMap(
      (resources: PicsureResource[]) => {

        this._allResources = resources;
        console.log(`Loaded PIC-SURE resources: ${resources.map((a) => a.name).join(', ')}`);

        this._searchResource = resources.find((res) => searchResName === res.name);
        this._queryResources = resources.filter((res) =>
          queryResNames.find((name) => name === res.name)
        );

        if (this.queryResources.length !== queryResNames.length || !this.searchResource) {
          throw new Error('Configured resources do not exist');
        } else {
          console.log(`Configured resources are ${this.searchResource.name}/${this.queryResources.map((a) => a.name).join(', ')}`);
          return Observable.of(true);
        }
      }
    );
  }

  // ------------------- getters/setter ----------------------
  get allResources(): PicsureResource[] {
    return this._allResources;
  }

  get queryResources(): PicsureResource[] {
    return this._queryResources;
  }

  get searchResource(): PicsureResource {
    return this._searchResource;
  }

  //  ------------------- others ----------------------



  /**
   * Returns the available PICSURE resources.
   * @returns {Observable<PicsureResource[]>}
   */
  getPicsureResources(): Observable<PicsureResource[]> {
    const urlPart = 'info/resources';
    return this.apiEndpointService.getCall(urlPart, false);
  }

  private getResourceCredentials(): ResourceCredentials {
    let rc = new ResourceCredentials();
    rc.MEDCO_TOKEN = this.authenticationService.token;
    return rc;
  }

  /**
   * Get a specific branch of the tree nodes
   *
   * @param {string} root - the path to the specific tree node, must include the first slash
   * can be omitted, default to CHILD server-side
   *
   * @returns {Observable<Object>}
   */
  getI2b2TreeNodes(root: string): Observable<TreeNode[]> {
    return this.initialized.concatMap(() => {

      let urlPart = `search/${this.searchResource.uuid}`;
      let body = {
        resourceCredentials: this.getResourceCredentials(),
        resourceUUID: this.searchResource.uuid,
        query: {
          type: "children",
          path: root
        }
      };

      return this.apiEndpointService.postCall(urlPart, body).map((searchResult: object) =>
        (searchResult["results"] as object[]).map((treeNodeObj: object) => {
          let treeNode = new TreeNode();
          treeNode.path = treeNodeObj['path'];
          treeNode.name = treeNodeObj['name'];
          treeNode.displayName = treeNodeObj['displayName'];
          treeNode.description = `${treeNodeObj['displayName']} (${treeNodeObj['code']})`;
          treeNode.conceptCode = treeNodeObj['code'];
          treeNode.metadata = treeNodeObj['metadata'];
          treeNode.leaf = treeNodeObj["leaf"];
          treeNode.encryptionDescriptor = treeNodeObj['medcoEncryption'];

          switch ((treeNodeObj['type'] as string).toLowerCase()) {
            case 'concept':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.SIMPLE;
              break;

            case 'concept_numeric':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.NUMERICAL;
              break;

            case 'concept_enum':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.CATEGORICAL;
              break;

            case 'concept_text':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.TEXT;
              break;

            case 'genomic_annotation':
              treeNode.nodeType = TreeNodeType.GENOMIC_ANNOTATION;
              treeNode.conceptType = undefined;
              break;

            default:
            case 'container':
              treeNode.nodeType = TreeNodeType.UNKNOWN;
              treeNode.conceptType = undefined;
              break;
          }

          treeNode.depth = treeNode.path.split('/').length - 2; // todo: check
          treeNode.children = [];
          treeNode.childrenAttached = false;

          return treeNode;
        })
      )
    }
  );
  }

  private generateQueryName(): string {
    let d = new Date();
    return `MedCo_Query_${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}${d.getUTCHours()}` +
      `${d.getUTCMinutes()}${d.getUTCSeconds()}${d.getUTCMilliseconds()}`;
  }

  /**
   * @returns {Observable<number>} the resultId
   * @param queryType
   * @param userPublicKey
   * @param resource
   * @param panels
   */
  querySync(queryType: MedcoQueryType, userPublicKey: string, resource: PicsureResource, panels: I2b2Panel[]): Observable<MedcoNodeResult> {
    let urlPart = 'query/sync';
    let body = {
      resourceCredentials: this.getResourceCredentials(),
      resourceUUID: resource.uuid,
      query: {
        name: this.generateQueryName(),
        'i2b2-medco': {
          queryType: queryType.id,
          panels: panels,
          userPublicKey: userPublicKey
        }
      }
    };
    return this.apiEndpointService.postCall(urlPart, body);
  }

  /**
   * Execute simultaneously the specified MedCo query on all the nodes.
   * Ensures before execute that the token is still valid.
   *
   * @param queryType
   * @param userPublicKey
   * @param panels
   */
  querySyncAllNodes(queryType: MedcoQueryType, userPublicKey: string, panels: I2b2Panel[]): Observable<MedcoNodeResult[]> {
    return this.authenticationService.authorise().switchMap(() =>
    Observable
      .forkJoin(...this.queryResources.map((res) => this.querySync(queryType, userPublicKey, res, panels)))
      .timeout(PicSureResourceService.QUERY_TIMEOUT_MS));
  }

  // getResultStatus(resultId: number): Observable<object> {
  //   let urlPart = `resultService/resultStatus/${resultId}`;
  //   return this.apiEndpointService.getCall(urlPart);
  // }
  //
  // getResult(resultId: number): Observable<object> {
  //   let urlPart = `resultService/result/${resultId}/JSON`;
  //   return this.apiEndpointService.getCall(urlPart);
  // }

  // -------------------------------------- helper calls --------------------------------------

  /**
   * Get aggregate (i.e. metadata) about a concept.
   * Is set to support from PIC-SURE only NUMERICAL, CATEGORICAL and ENCRYPTED aggregates.
   * @param {Concept} concept
   * @returns {Observable<Aggregate>}
   */
  getAggregate(concept: Concept): Observable<Aggregate> {
    // todo
    return Observable.of(new Aggregate());
    // switch (concept.type) {
    //   case ConceptType.ENCRYPTED:
    //
    //     // find tree node from the concept
    //     let treeNode = [];
    //     this.injector.get(TreeNodeService).findTreeNodesByPaths(
    //       this.injector.get(TreeNodeService).treeNodes,
    //       [concept.fullName],
    //       treeNode
    //     );
    //
    //     if (treeNode.length !== 1) {
    //       console.warn(`Expected 1 tree node, got ${treeNode}`);
    //       return Observable.of(new Aggregate());
    //     }
    //
    //     // embed the values in aggregate
    //     if (treeNode[0] && treeNode[0].metadata['encrypt.nodeid']) {
    //       let agg = new EncryptIdsAggregate();
    //       agg.ownId = treeNode[0].metadata['encrypt.nodeid'];
    //       agg.childrenIds = []; // todo: implement children querying
    //       return Observable.of(agg);
    //     }
    //
    //     console.warn(`No encrypt ID found for ${concept.name}`);
    //     return Observable.of(new Aggregate());
    //
    //   case ConceptType.CATEGORICAL:
    //     return this.getI2b2TreeNodes(concept.path+ 'AGGREGATE').map((picsureTreeNodes) => { // todo
    //
    //       let attributeKeys: string[] = Object.keys(picsureTreeNodes[0].metadata);
    //       switch (concept.type) {
    //         case ConceptType.CATEGORICAL:
    //           let agg = new CategoricalAggregate();
    //           attributeKeys
    //             .filter((attrKey) => attrKey.startsWith('aggregate.categorical'))
    //             .forEach((catAggKey) => agg.valueCounts.set(picsureTreeNodes[0].metadata[catAggKey], -1));
    //           return agg;
    //
    //         default:
    //           console.warn(`Returning empty aggregate for ${concept.path}, problem?`);
    //           return new Aggregate();
    //       }
    //     });
    //
    //   default:
    //     return Observable.of(new Aggregate());
    // }
  }

  getI2b2MedCoPatientsCounts(queryType: MedcoQueryType, constraint: Constraint): Observable<CountItem> {
    if (constraint.className === 'TrueConstraint') {
      return Observable.of(new CountItem(0, 0));
    } else if (constraint.className !== 'CombinationConstraint') {
      throw new Error('Only root constraint accepted.');
    }

    return this.genomicAnnotationsService.addVariantIdsToConstraints(constraint)
      .switchMap(() => this.querySyncAllNodes(
        queryType,
        this.medcoService.publicKey,
        this.picsureMappingService.mapI2b2MedCoConstraint(constraint)
        )
        .map((results: MedcoNodeResult[]) => {
          if (results.length !== this.queryResources.length) {
            console.error(`Inconsistent results (${results.length} results)`);
            return new CountItem(-1,-1);
          }

          return new CountItem(this.medcoService.parseMedCoResults(results), -1);
        })
      );
  }

  /**
   * Periodically poll status of result and wait until it is available, or if an error happen.
   * return result if available, null if problem
   *
   * @param {number} resultId
   * @returns {Observable<boolean>} true if result is available, false if error or timeout
   */
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
