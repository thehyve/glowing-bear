import {Injectable, Injector} from '@angular/core';
import {PicsureResource} from '../../models/picsure-models/resource-definition/picsure-resource';
import {AppConfig} from '../../config/app.config';
import {Observable} from 'rxjs/Observable';
import {WhereClause} from '../../models/picsure-models/request/where-clause';
import {Aggregate} from '../../models/aggregate-models/aggregate';
import {Constraint} from '../../models/constraint-models/constraint';
import {TreeNode} from '../../models/tree-models/tree-node';
import {CategoricalAggregate} from '../../models/aggregate-models/categorical-aggregate';
import {PicsureConstraintMapper} from '../../utilities/picsure-utilities/picsure-constraint-mapper';
import {ApiEndpointService} from '../api-endpoint.service';
import {ConceptType} from '../../models/constraint-models/concept-type';
import {TreeNodeType} from '../../models/tree-models/tree-node-type';
import {SelectClause} from '../../models/picsure-models/request/select-clause';
import {Concept} from '../../models/constraint-models/concept';
import {CountItem} from '../../models/aggregate-models/count-item';
import {MedcoService} from './medco.service';
import {GenomicAnnotationsService} from "./genomic-annotations.service";
import {TreeNodeService} from "../tree-node.service";
import {EncryptIdsAggregate} from "../../models/aggregate-models/encrypt-ids-aggregate";

@Injectable()
export class PicSureResourceService {

  /**
   * Contains the PICSURE resource currently used by Glowing Bear.
   */
  private _currentResource: PicsureResource;

  /**
   * List of resources declared by the backend.
   */
  private _resources: PicsureResource[];

  initialized: Observable<boolean>;

  constructor(private config: AppConfig,
              private apiEndpointService: ApiEndpointService,
              private medcoService: MedcoService,
              private genomicAnnotationsService: GenomicAnnotationsService,
              private injector: Injector) {
    this.initialized = this.loadResource(this.config.getConfig('picsure-resource-name')).shareReplay(1);
  }

  init() {
    this.initialized.subscribe();
  }


  private loadResource(resourceName: string) {
    return this.getPicsureResources().switchMap(
      (resources: PicsureResource[]) => {

        // get all resources
        this._resources = resources;
        console.log(`Loaded PIC-SURE resources: ${resources.map((a) => a.name).join(', ')}`);

        // find current resource
        this._currentResource = this._resources.find((res) =>
          res.name === resourceName
        );

        if (this._currentResource === undefined) {
          throw new Error('Configured resource does not exist');
        } else {
          console.log(`Configured resource is ${this._currentResource.name}`);
          return Observable.of(true);
        }
      }
    );
  }

  // ------------------- getters/setter ----------------------
  get resources(): PicsureResource[] {
    return this._resources;
  }

  get currentResource(): PicsureResource {
    return this._currentResource;
  }

  //  ------------------- others ----------------------



  /**
   * Returns the available PICSURE resources.
   * @returns {Observable<PicsureResource[]>}
   */
  getPicsureResources(): Observable<PicsureResource[]> {
    const urlPart = 'resourceService/resources';
    return this.apiEndpointService.getCall(urlPart, false);
  }

  /// tbd
  /**
   * Get a specific branch of the tree nodes
   *
   * @param {string} root - the path to the specific tree node, must include the first slash
   * @param {number} relationship - relationship requested (according to support or the resource),
   * can be omitted, default to CHILD server-side
   *
   * @returns {Observable<Object>}
   */
  getTreeNodes(root: string, relationship?: string): Observable<TreeNode[]> {
    // todo: implement here retrieval of the modifiers
    let urlPart = `resourceService/path${root}`;
    if (relationship) {
      urlPart += `?relationship=${relationship}`;
    }
    return this.apiEndpointService.getCall(urlPart, false).map((res: object[]) => {
      return res.map((treeNodeObj: object) => {
        let treeNode = new TreeNode();
        treeNode.path = (treeNodeObj['pui'] as string).replace('%2F', '/');
        treeNode.name = treeNodeObj['name'];
        treeNode.displayName = treeNodeObj['displayName'];
        treeNode.description = treeNodeObj['description'];

        treeNode.conceptCode = `${treeNodeObj['ontology']}:${treeNodeObj['ontologyId']}`;
        treeNode.metadata = treeNodeObj['attributes'];

        // extract concept type
        if (treeNodeObj['dataType']) {
          switch (String(treeNodeObj['dataType']).toLowerCase()) {
            case 'enc_concept':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.ENCRYPTED;
              break;

            case 'concept_numeric':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.NUMERICAL;
              break;

            case 'concept_enum':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.CATEGORICAL;
              break;

            case 'concept_string':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.TEXT;
              break;

            case 'genomic_annotation':
              treeNode.nodeType = TreeNodeType.GENOMIC_ANNOTATION;
              // todo: the value to query for annotations should be taken from elsewhere
              treeNode.name = treeNodeObj['ontologyId'];
              break;

            case 'concept':
            default:
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.SIMPLE;
              break;

          }
        } else {
          treeNode.nodeType = TreeNodeType.UNKNOWN;
          treeNode.conceptType = undefined;
        }

        treeNode.depth = treeNode.path.split('/').length - 2;

        treeNode.children = [];
        treeNode.childrenAttached = false;
        treeNode.leaf = !(treeNodeObj['relationships'] as string[]).includes('CHILD');

        return treeNode;
      })
    });
  }

  /**
   * @param {any[]} selectClauses
   * @param {WhereClause[]} whereClauses
   * @param {string} urlParams
   * @returns {Observable<number>} the resultId
   */
  runQuery(selectClauses?: SelectClause[], whereClauses?: WhereClause[], urlParams?: string): Observable<object> {
    let urlPart = 'queryService/runQuery';
    if (urlParams) {
      urlPart += `?${urlParams}`;
    }

    let query = {};
    if (selectClauses) {
      query['select'] = selectClauses;
    }
    if (whereClauses) {
      query['where'] = whereClauses;
    }

    return this.apiEndpointService.postCall(urlPart, query);
  }

  getResultStatus(resultId: number): Observable<object> {
    let urlPart = `resultService/resultStatus/${resultId}`;
    return this.apiEndpointService.getCall(urlPart);
  }

  getResult(resultId: number): Observable<object> {
    let urlPart = `resultService/result/${resultId}/JSON`;
    return this.apiEndpointService.getCall(urlPart);
  }

  // -------------------------------------- helper calls --------------------------------------

  getRootTreeNodes(): Observable<TreeNode[]> {
    return this.initialized.flatMap(() =>
      this.getTreeNodes(`/${this.currentResource.name}`, 'CHILD')
    );
  }

  getChildNodes(treeRoot?: string): Observable<TreeNode[]> {
    return this.getTreeNodes(treeRoot, 'CHILD');
  }

  /**
   * Get aggregate (i.e. metadata) about a concept.
   * Is set to support from PIC-SURE only NUMERICAL, CATEGORICAL and ENCRYPTED aggregates.
   * @param {Concept} concept
   * @returns {Observable<Aggregate>}
   */
  getAggregate(concept: Concept): Observable<Aggregate> {
    // todo: numerical implementation

    switch (concept.type) {
      case ConceptType.ENCRYPTED:

        // find tree node from the concept
        let treeNode = [];
        this.injector.get(TreeNodeService).findTreeNodesByPaths(
          this.injector.get(TreeNodeService).treeNodes,
          [concept.fullName],
          treeNode
        );

        if (treeNode.length !== 1) {
          console.warn(`Expected 1 tree node, got ${treeNode}`);
          return Observable.of(new Aggregate());
        }

        // embed the values in aggregate
        if (treeNode[0] && treeNode[0].metadata['encrypt.nodeid']) {
          let agg = new EncryptIdsAggregate();
          agg.ownId = treeNode[0].metadata['encrypt.nodeid'];
          agg.childrenIds = []; // todo: implement children querying
          return Observable.of(agg);
        }

        console.warn(`No encrypt ID found for ${concept.name}`);
        return Observable.of(new Aggregate());

      case ConceptType.CATEGORICAL:
        return this.getTreeNodes(concept.path, 'AGGREGATE').map((picsureTreeNodes) => {

          let attributeKeys: string[] = Object.keys(picsureTreeNodes[0].metadata);
          switch (concept.type) {
            case ConceptType.CATEGORICAL:
              let agg = new CategoricalAggregate();
              attributeKeys
                .filter((attrKey) => attrKey.startsWith('aggregate.categorical'))
                .forEach((catAggKey) => agg.valueCounts.set(picsureTreeNodes[0].metadata[catAggKey], -1));
              return agg;

            default:
              console.warn(`Returning empty aggregate for ${concept.path}, problem?`);
              return new Aggregate();
          }
        });

      default:
        return Observable.of(new Aggregate());
    }
  }

  getPatientsCounts(constraint: Constraint): Observable<CountItem> {
    if (constraint.className === 'TrueConstraint') {
      return Observable.of(new CountItem(0, 0));
    }

    return this.genomicAnnotationsService.addVariantIdsToConstraints(constraint)
      .switchMap(() => this.runQuery(
        [],
        PicsureConstraintMapper.mapConstraint(constraint, this.injector),
        'only_count=true'
      )
        .switchMap((res) => this.waitOnResult(res['resultId']))
        .map((result) => {
          let data = result['data'][0];
          if (data[0]['patient_set_counts']) {
            return new CountItem(
              Number(data[0]['patient_set_counts']),
              -1
            );
          } else if (data[0]['medco_results_0']) {
            return new CountItem(
              this.medcoService.parseMedCoResults(data),
              -1
            );
          } else {
            console.error('No result detected.');
            return new CountItem(
              -1,
              -1
            );
          }
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
  waitOnResult(resultId: number): Observable<object> {
    return Observable
      .interval(1000)
      .flatMap(() => this.getResultStatus(resultId))
      .do((resultStatus) => console.log(`Result ${resultId} is ${resultStatus['status']}`))
      .filter((resultStatus) => resultStatus['status'] === 'AVAILABLE' || resultStatus['status'] === 'ERROR')
      .take(1)
      .flatMap((resultStatus) => resultStatus['status'] === 'AVAILABLE' ?
        this.getResult(resultId) :
        Observable.throw(`Error of result ${resultId}: ${resultStatus['message']}`))
      .timeout(60000);
  }
}