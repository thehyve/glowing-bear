import {Injectable} from '@angular/core';
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

@Injectable()
export class PicSureResourceService {

  /**
   * Contains the IRCT resource currently used by Glowing Bear.
   */
  private _currentResource: PicsureResource;

  /**
   * List of resources declared by the backend.
   */
  private _resources: PicsureResource[];

  initialized: Observable<boolean>;

  constructor(private config: AppConfig,
              private apiEndpointService: ApiEndpointService) {
    this.initialized = this.loadResource(this.config.getConfig('picsure-resource-name')).shareReplay(1);
  }

  init() {
    this.initialized.subscribe();
  }

  // ------------------- public helpers ----------------------

  // ------------------- private helpers ----------------------

  private loadResource(resourceName: string) {
    return this.getIRCTResources().switchMap(
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
        } else if (!this.checkMinimumRequirements()) {
          throw new Error('Configured resource does not match the minimum Glowing Bear requirements.')
        } else {
          console.log(`Configured resource is ${this._currentResource.name}`);
          return Observable.of(true);
        }
      }
    );
  }

  private checkMinimumRequirements(): boolean {
    // todo: type of things is tree
    // todo: predicates and data types needed
    return true;
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
   * Returns the available IRCT resources.
   * @returns {Observable<PicsureResource[]>}
   */
  getIRCTResources(): Observable<PicsureResource[]> {
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
        // todo: treeNode.dropMode = DropMode.TreeNode;?

        // extract concept type
        if (treeNodeObj['dataType']) {
          treeNode.nodeType = TreeNodeType.CONCEPT;
          let type: ConceptType = ConceptType[String(treeNodeObj['dataType'])];
          treeNode.conceptType = type ? type : ConceptType.SIMPLE;
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

  // todo: result status model
  getResultStatus(resultId: number): Observable<object> {
    let urlPart = `resultService/resultStatus/${resultId}`;
    return this.apiEndpointService.getCall(urlPart);
  }

  // todo: result model
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

  //   getStudies(): Observable<DimensionField[]> {
  //   return this.getTreeNodes(`/${this.appConfig.getConfig('picsure-resource-name')}`, 'STUDY')
  //     .map((irctTreeNodes) => {
  //       return irctTreeNodes.map(irctTreeNode => { return {
  //         id: irctTreeNode.getOntologyCode(),
  //         name: irctTreeNode.name,
  //         pui: irctTreeNode.pui
  //       }});
  //     });
  // }

  // getTrialVisits(conceptPui: string): Observable<DimensionField[]> {
  //   return this.getTreeNodes(conceptPui, 'TRIAL_VISIT').map((irctTreeNodes) => {
  //     return irctTreeNodes.map(irctTreeNode => { return {
  //       id: irctTreeNode.getOntologyCode(),
  //       name: irctTreeNode.name,
  //       pui: irctTreeNode.pui
  //     }});
  //   });
  // }

  // getPedigreeRelationTypes(): Observable<PedigreeRelationTypeResponse[]> {
  //   return this.getTreeNodes(`/${this.appConfig.getConfig('picsure-resource-name')}`, 'PEDIGREE')
  //     .map((irctTreeNodes) => {
  //       return irctTreeNodes.map(irctTreeNode => {
  //         let relType: PedigreeRelationTypeResponse = new PedigreeRelationTypeResponse();
  //         relType.label = irctTreeNode.name;
  //         relType.description = irctTreeNode.description;
  //         relType.biological = irctTreeNode.attributes['biological'];
  //         relType.symmetrical = irctTreeNode.attributes['symmetrical'];
  //         relType.pui = irctTreeNode.pui;
  //         return relType;
  //       });
  //     });
  // }

  // todo: the way aggregate objects are returned might be suboptimal
  getAggregate(concept: Concept): Observable<Aggregate> {
    return this.getTreeNodes(concept.path, 'AGGREGATE').map((irctTreeNodes) => {

      let attributeKeys: string[] = Object.keys(irctTreeNodes[0].metadata);
      switch (concept.type) {
        case ConceptType.CATEGORICAL:
          let agg = new CategoricalAggregate();
          attributeKeys
            .filter((attrKey) => attrKey.startsWith('aggregate.categorical'))
            .forEach((catAggKey) => agg.valueCounts.set(irctTreeNodes[0].metadata[catAggKey], -1));
          return agg;

        case ConceptType.DATE:
        case ConceptType.NUMERICAL:
          console.error('TBD'); // todo + other types??
          break;

        default:
          return new Aggregate();
      }
    });
  }

  getPatientsCounts(constraint: Constraint): Observable<CountItem> {
    if (constraint.className === 'TrueConstraint') {
      return Observable.of(new CountItem(0, 0));
    }

    return this.runQuery(
      [],
      PicsureConstraintMapper.mapConstraint(constraint),
      'only_count=true'
    )
      .switchMap((res) => this.waitOnResult(res['resultId']))
      .map((result) => new CountItem(
        Number(result['data'][0][0]['patient_set_counts']),
        0
      ));
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
      .interval(1000) // todo config
      .flatMap(() => this.getResultStatus(resultId))
      .do((resultStatus) => console.log(`Result ${resultId} is ${resultStatus['status']}`))
      .filter((resultStatus) => resultStatus['status'] === 'AVAILABLE' || resultStatus['status'] === 'ERROR')
      .take(1)
      .flatMap((resultStatus) => resultStatus['status'] === 'AVAILABLE' ?
        this.getResult(resultId) :
        Observable.throw(`Error of result ${resultId}: ${resultStatus['message']}`))
      .timeout(60000) // todo config
  }
}
