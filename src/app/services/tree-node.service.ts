import {Injectable} from '@angular/core';
import {Study} from '../models/study';
import {Constraint} from '../models/constraints/constraint';
import {Concept} from '../models/concept';
import {StudyConstraint} from '../models/constraints/study-constraint';
import {ConceptConstraint} from '../models/constraints/concept-constraint';
import {CombinationConstraint} from '../models/constraints/combination-constraint';
import {TreeNode} from 'primeng/primeng';
import {ResourceService} from './resource.service';
import {Query} from '../models/query';
import {PedigreeConstraint} from '../models/constraints/pedigree-constraint';

type LoadingState = 'loading' | 'complete';

@Injectable()
export class TreeNodeService {

  // the variable that holds the entire tree structure, used by the tree on the left
  public treeNodes: TreeNode[] = [];
  // the copy of the tree nodes that is used for constructing the tree in the 2nd step (projection)
  public treeNodesCopy: TreeNode[] = [];
  // the entire tree table data that holds the patients' observations in the 2nd step (projection)
  private _projectionTreeData: TreeNode[] = [];
  // the selected tree table data that holds the patients' observations in the 2nd step (projection)
  private _selectedProjectionTreeData: TreeNode[] = [];

  public treeNodeCallsSent = 0; // the number of tree-node calls sent
  public treeNodeCallsReceived = 0; // the number of tree-node calls received

  // the status indicating the when the tree is being loaded or finished loading
  public loadingTreeNodes: LoadingState = 'complete';
  private _studies: Study[] = [];
  private _studyConstraints: Constraint[] = [];
  private _concepts: Concept[] = [];
  private _conceptLabels: string[] = [];
  private _conceptConstraints: Constraint[] = [];
  private _queries: Query[] = [];

  // List keeping track of all available constraints. By default, the empty
  // constraints are in here. In addition, (partially) filled constraints are
  // added. The constraints should be copied when editing them.
  private _allConstraints: Constraint[] = [];
  private _validTreeNodeTypes: string[] = [];
  private _validPedigreeTypes: object[] = [];

  constructor(private resourceService: ResourceService) {
    this.validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL',
      'DATE',
      'STUDY',
      'TEXT',
      'UNKNOWN'
    ];
    this.loadEmptyConstraints();
    this.loadStudies();
    // also construct concepts while loading the tree nodes
    this.loadTreeNodes();
    this.loadQueries();
    // create the pedigree-related constraints
    this.loadPedigrees();
  }

  private loadEmptyConstraints() {
    this.allConstraints.push(new CombinationConstraint());
    this.allConstraints.push(new StudyConstraint());
    this.allConstraints.push(new ConceptConstraint());
  }

  private loadStudies() {
    this.resourceService.getStudies()
      .subscribe(
        studies => {
          // reset studies and study constraints
          this.studies = studies;
          this.studyConstraints = [];
          studies.forEach(study => {
            let constraint = new StudyConstraint();
            constraint.studies.push(study);
            this.studyConstraints.push(constraint);
            this.allConstraints.push(constraint);
          });
        },
        err => console.error(err)
      );
  }

  private loadPedigrees() {
    this.resourceService.getPedigreeRelationTypes()
      .subscribe(
        relationTypeObjects => {
          for (let obj of relationTypeObjects) {
            let pedigreeConstraint = new PedigreeConstraint(obj['label']);
            pedigreeConstraint.description = obj['description'];
            pedigreeConstraint.biological = obj['biological'];
            pedigreeConstraint.symmetrical = obj['symmetrical'];
            this.allConstraints.push(pedigreeConstraint);
            this.validPedigreeTypes.push({
              type: pedigreeConstraint.relationType,
              text: pedigreeConstraint.textRepresentation
            });
          }
        },
        err => console.error(err)
      );
  }

  /**
   * Extracts concepts (and later possibly other dimensions) from the
   *  provided TreeNode array and their children.
   *  And augment tree nodes with PrimeNG tree-ui specifications
   * @param treeNodes
   */
  private processTreeNodes(treeNodes: object[]) {
    if (!treeNodes) {
      return;
    }
    for (let node of treeNodes) {
      this.processTreeNode(node);
      if (node['children']) {
        this.processTreeNodes(node['children']);
      }
    }
  }

  private processTreeNode(node: Object) {
    // Extract concept
    if (node['visualAttributes'].includes('LEAF')) {
      let concept = this.getConceptFromTreeNode(node);
      if (this.conceptLabels.indexOf(concept.label) === -1) {
        this.concepts.push(concept);
        this.conceptLabels.push(concept.label);
        let constraint = new ConceptConstraint();
        constraint.concept = concept;
        this.conceptConstraints.push(constraint);
        this.allConstraints.push(constraint);
      }
      if (node['constraint']) {
        node['constraint']['fullName'] = node['fullName'];
        node['constraint']['name'] = node['name'];
        node['constraint']['conceptPath'] = node['conceptPath'];
        node['constraint']['conceptCode'] = node['conceptCode'];
        node['constraint']['valueType'] = node['type'];
      }
    }
    // Add PrimeNG visual properties for tree nodes
    let countStr = ' ';
    node['label'] = node['name'] + countStr;
    if (node['metadata']) {
      node['label'] = node['label'] + ' \t\u2139';
    }
    if (node['children']) {
      if (node['type'] === 'UNKNOWN') {
        node['expandedIcon'] = 'fa-folder-open';
        node['collapsedIcon'] = 'fa-folder';
      } else if (node['type'] === 'STUDY') {
        node['expandedIcon'] = 'icon-folder-study-open';
        node['collapsedIcon'] = 'icon-folder-study';
      }
      node['icon'] = '';
    } else {
      if (node['type'] === 'NUMERIC') {
        node['icon'] = 'icon-123';
      } else if (node['type'] === 'HIGH_DIMENSIONAL') {
        node['icon'] = 'icon-hd';
      } else if (node['type'] === 'CATEGORICAL') {
        node['icon'] = 'icon-abc';
      } else if (node['type'] === 'DATE') {
        node['icon'] = 'fa-calendar';
      } else if (node['type'] === 'TEXT') {
        node['icon'] = 'fa-newspaper-o';
      } else {
        node['icon'] = 'fa-folder-o';
      }
    }
  }

  /**
   * Parse a tree node and create the corresponding concept
   * @param {TreeNode} treeNode
   * @returns {Concept}
   */
  public getConceptFromTreeNode(treeNode: TreeNode): Concept {
    let concept = new Concept();
    const tail = '\\' + treeNode['name'] + '\\';
    const fullName = treeNode['fullName'];
    let head = fullName.substring(0, fullName.length - tail.length);
    concept.label = treeNode['name'] + ' (' + head + ')';
    concept.path = treeNode['conceptPath'];
    concept.type = treeNode['type'];
    concept.code = treeNode['conceptCode'];
    concept.fullName = treeNode['fullName'];
    concept.name = treeNode['name'];
    return concept;
  }

  /**
   * Get the descendants of a tree node up to a predefined depth
   * @param {TreeNode} treeNode
   * @param {number} depth
   * @param {TreeNode[]} descendants
   */
  public getTreeNodeDescendantsWithDepth(treeNode: TreeNode,
                                         depth: number,
                                         descendants: TreeNode[]) {
    if (treeNode) {
      if (depth === 2) {
        if (treeNode['children']) {
          for (let child of treeNode['children']) {
            descendants.push(child);
          }
        }
      } else if (depth > 2) {
        if (treeNode['children']) {
          for (let child of treeNode['children']) {
            let newDepth = depth - 1;
            this.getTreeNodeDescendantsWithDepth(child, newDepth, descendants);
          }
        }
      }
    }
  }

  /**
   * Get the descendants of a tree node if a descendant has a type
   * that is not excluded
   * @param {TreeNode} treeNode
   * @param {string[]} excludedTypes
   * @param {TreeNode[]} descendants
   */
  public getTreeNodeDescendantsWithExcludedTypes(treeNode: TreeNode,
                                                 excludedTypes: string[],
                                                 descendants: TreeNode[]) {
    if (treeNode) {
      // If the tree node has children
      if (treeNode['children']) {
        for (let child of treeNode['children']) {
          if (child['children']) {
            this.getTreeNodeDescendantsWithExcludedTypes(child, excludedTypes, descendants);
          } else if (excludedTypes.indexOf(child['type']) === -1) {
            descendants.push(child);
          }
        }
      }
    }
  }

  /**
   * Update the tree table data for rendering the tree table in step 2, projection
   * based on a given set of concept codes as filtering criteria.
   * @param {Object} conceptCountMap
   */
  public updateProjectionTreeData(conceptCountMap: object, checklist: Array<string>) {
    // If the tree nodes copy is empty, create it by duplicating the tree nodes
    if (this.treeNodesCopy.length === 0) {
      this.treeNodesCopy = this.copyTreeNodes(this.treeNodes);
    }
    let conceptCodes = [];
    for (let code in conceptCountMap) {
      conceptCodes.push(code);
    }
    this.projectionTreeData =
      this.updateProjectionTreeDataIterative(this.treeNodesCopy, conceptCodes, conceptCountMap);
    this.selectedProjectionTreeData = [];
    this.checkProjectionTreeDataIterative(this.projectionTreeData, checklist);
  }

  private copyTreeNodes(nodes: TreeNode[]): TreeNode[] {
    let nodesCopy = [];
    for (let node of nodes) {
      let parent = node['parent'];
      let children = node['children'];
      node['parent'] = null;
      node['children'] = null;
      let nodeCopy = JSON.parse(JSON.stringify(node));
      if (children) {
        let childrenCopy = this.copyTreeNodes(children);
        nodeCopy['children'] = childrenCopy;
      }
      nodesCopy.push(nodeCopy);
      node['parent'] = parent;
      node['children'] = children;
    }
    return nodesCopy;
  }

  private updateProjectionTreeDataIterative(nodes: TreeNode[],
                                            conceptCodes: string[],
                                            conceptCountMap: object) {
    let nodesWithCodes = [];
    for (let node of nodes) {
      if (conceptCodes.indexOf(node['conceptCode']) !== -1) {
        let nodeCopy = node;
        nodeCopy['expanded'] = false;
        if (conceptCountMap[node['conceptCode']]) {
          const patientCount = conceptCountMap[node['conceptCode']]['patientCount'];
          const observationCount = conceptCountMap[node['conceptCode']]['observationCount'];
          nodeCopy['label'] = nodeCopy['name'] + ` (sub: ${patientCount}, obs: ${observationCount})`;
        }
        nodesWithCodes.push(nodeCopy);
      } else if (node['children']) {
        let newNodeChildren =
          this.updateProjectionTreeDataIterative(node['children'], conceptCodes, conceptCountMap);
        if (newNodeChildren.length > 0) {
          let nodeCopy = node;
          nodeCopy['expanded'] = this.depthOfTreeNode(nodeCopy) > 2 ? false : true;
          nodeCopy['children'] = newNodeChildren;
          nodesWithCodes.push(nodeCopy);
        }
      }
    }
    return nodesWithCodes;
  }

  public checkProjectionTreeDataIterative(nodes: TreeNode[], checklist?: Array<string>) {
    for (let node of nodes) {
      if (!checklist || checklist.indexOf(node['fullName']) !== -1) {
        this.selectedProjectionTreeData.push(node);
      }
      if (node['children']) {
        this.checkProjectionTreeDataIterative(node['children'], checklist);
      }
    }
  }

  private depthOfTreeNode(node: TreeNode): number {
    return node['fullName'] ? node['fullName'].split('\\').length - 2 : null;
  }

  public expandProjectionTreeDataIterative(nodes: TreeNode[], value: boolean) {
    for (let node of nodes) {
      node['expanded'] = value;
      if (node['children']) {
        this.expandProjectionTreeDataIterative(node['children'], value);
      }
    }
  }

  /**
   * Iteratively load the descendants of the given tree node
   * @param parentNode
   */
  private loadTreeNext(parentNode) {
    this.treeNodeCallsSent++;
    let depth = 20;
    this.resourceService.getTreeNodes(parentNode['fullName'], depth, false, true)
      .subscribe(
        (treeNodes: object[]) => {
          this.treeNodeCallsReceived++;
          const refNode = treeNodes && treeNodes.length > 0 ? treeNodes[0] : undefined;
          const children = refNode ? refNode['children'] : undefined;
          if (children) {
            parentNode['children'] = children;
          }
          this.processTreeNode(parentNode);
          this.processTreeNodes(children);
          let descendants = [];
          this.getTreeNodeDescendantsWithDepth(refNode, depth, descendants);
          if (descendants.length > 0) {
            for (let descendant of descendants) {
              this.loadTreeNext(descendant);
            }
          }
        },
        err => console.error(err)
      );
  }

  /**
   * Load the tree nodes for rendering the tree on the left side panel.
   */
  loadTreeNodes() {
    this.conceptLabels = [];
    this.loadingTreeNodes = 'loading';
    // Retrieve all tree nodes and extract the concepts iteratively
    this.resourceService.getTreeNodes('\\', 2, false, false)
      .subscribe(
        (treeNodes: object[]) => {
          this.loadingTreeNodes = 'complete';
          // reset concepts and concept constraints
          this.concepts = [];
          this.conceptConstraints = [];
          this.processTreeNodes(treeNodes);
          treeNodes.forEach((function (node) {
            this.treeNodes.push(node); // to ensure the treeNodes pointer remains unchanged
            this.loadTreeNext(node);
          }).bind(this));
        },
        err => console.error(err)
      );
  }

  /**
   * Flag all tree nodes' selections to true or false
   * @param {boolean} flag
   */
  public selectAllTreeNodes(flag: boolean) {
    this.selectAllTreeNodesIterative(this.treeNodes, flag);
  }

  private selectAllTreeNodesIterative(nodes: TreeNode[], flag: boolean) {
    for (let node of nodes) {
      node['selected'] = flag;
      if (node['partialSelected']) {
        node['partialSelected'] = false;
      }
      if (node['children']) {
        this.selectAllTreeNodesIterative(node['children'], flag);
      }
    }
  }

  /**
   * Given a list of tree nodes, find and return
   * the node(s) that are on the topmost of the hierarchies of their respective branches
   * e.g.
   * given these nodes:
   * [ A\B\C,
   *   A\B
   *   A\D\E,
   *   A\D\E\F,
   *   A\E ]
   * --------------------------
   * return:
   * [ A\B,
   *   A\D\E,
   *   A\E ]
   * @param {TreeNode[]} treeNodes
   * @returns {TreeNode[]}
   */
  public getTopTreeNodes(treeNodes: TreeNode[]): TreeNode[] {
    let candidates = [];
    let result = [];
    for (let node of treeNodes) {
      const path = node['fullName'];
      let isPathUsed = false;
      for (let candidate of candidates) {
        if (path.indexOf(candidate) > -1) {
          // if the candidate is part of the path
          isPathUsed = true;
          break;
        } else if (candidate.indexOf(path) > -1) {
          // if the path is part of the candidate
          // remove the candidate, replace it with the path
          const index = candidates.indexOf(candidate);
          candidates.splice(index, 1);
          candidates.push(path);
          result.splice(index, 1);
          result.push(node);
          isPathUsed = true;
          break;
        }
      }
      if (!isPathUsed) {
        candidates.push(path);
        result.push(node);
      }
    }
    return result;
  }

  /**
   * Find the tree nodes that have the fullNames (i.e. tree paths) in the given paths
   * @param {TreeNode[]} nodes
   * @param {string[]} paths
   * @param {TreeNode[]} foundNodes
   */
  public findTreeNodesByPaths(nodes: TreeNode[], paths: string[], foundNodes: TreeNode[]) {
    for (let node of nodes) {
      if (paths.indexOf(node['fullName']) !== -1) {
        foundNodes.push(node);
      }
      if (node['children']) {
        this.findTreeNodesByPaths(node['children'], paths, foundNodes);
      }
    }
  }

  /**
   * Find the ancestors of a tree node
   * @param node
   * @returns {Array}
   */
  public findTreeNodeAncestors(node) {
    let fullName = node['fullName'];
    let partsTemp = fullName.split('\\');
    let parts = [];
    for (let part of partsTemp) {
      if (part !== '') {
        parts.push(part);
      }
    }
    let endingIndices = [];
    for (let i = 0; i < parts.length - 1; i++) {
      endingIndices.push(i);
    }
    let paths = [];
    for (let index of endingIndices) {
      let path = '\\';
      for (let i = 0; i <= index; i++) {
        path += parts[i] + '\\';
      }
      paths.push(path);
    }
    let foundNodes = [];
    this.findTreeNodesByPaths(this.treeNodes, paths, foundNodes);
    return foundNodes;
  }

  /**
   * Update the queries on the left-side panel
   */
  public loadQueries() {
    this.resourceService.getQueries()
      .subscribe(
        (queries) => {
          this.queries.length = 0;
          let bookmarkedQueries = [];
          queries.forEach(query => {
            query['collapsed'] = true;
            query['visible'] = true;
            if (query['bookmarked']) {
              bookmarkedQueries.push(query);
            } else {
              this.queries.push(query);
            }
          });
          this.queries = bookmarkedQueries.concat(this.queries);
        },
        err => console.error(err)
      );
  }

  get concepts(): Concept[] {
    return this._concepts;
  }

  set concepts(value: Concept[]) {
    this._concepts = value;
  }

  get conceptLabels(): string[] {
    return this._conceptLabels;
  }

  set conceptLabels(value: string[]) {
    this._conceptLabels = value;
  }

  get studies(): Study[] {
    return this._studies;
  }

  set studies(value: Study[]) {
    this._studies = value;
  }

  get queries(): Query[] {
    return this._queries;
  }

  set queries(value: Query[]) {
    this._queries = value;
  }

  get projectionTreeData(): TreeNode[] {
    return this._projectionTreeData;
  }

  set projectionTreeData(value: TreeNode[]) {
    this._projectionTreeData = value;
  }

  get selectedProjectionTreeData(): TreeNode[] {
    return this._selectedProjectionTreeData;
  }

  set selectedProjectionTreeData(value: TreeNode[]) {
    this._selectedProjectionTreeData = value;
  }

  get validTreeNodeTypes(): string[] {
    return this._validTreeNodeTypes;
  }

  set validTreeNodeTypes(value: string[]) {
    this._validTreeNodeTypes = value;
  }

  get studyConstraints(): Constraint[] {
    return this._studyConstraints;
  }

  set studyConstraints(value: Constraint[]) {
    this._studyConstraints = value;
  }

  get conceptConstraints(): Constraint[] {
    return this._conceptConstraints;
  }

  set conceptConstraints(value: Constraint[]) {
    this._conceptConstraints = value;
  }

  get allConstraints(): Constraint[] {
    return this._allConstraints;
  }

  set allConstraints(value: Constraint[]) {
    this._allConstraints = value;
  }

  get validPedigreeTypes(): object[] {
    return this._validPedigreeTypes;
  }

  set validPedigreeTypes(value: object[]) {
    this._validPedigreeTypes = value;
  }

  /**
   * Returns a list of all constraints that match the query string.
   * The constraints should be copied when editing them.
   * @param query
   * @returns {Array}
   */
  searchAllConstraints(query: string): Constraint[] {
    query = query.toLowerCase();
    let results = [];
    this.allConstraints.forEach((constraint: Constraint) => {
      let text = constraint.textRepresentation.toLowerCase();
      if (text.indexOf(query) > -1) {
        results.push(constraint);
      }
    });
    return results;
  }

  /**
   * Check if a tree node is a concept node
   * @param {TreeNode} node
   * @returns {boolean}
   */
  public isTreeNodeAconcept(node: TreeNode): boolean {
    const type = node['type'];
    return (type === 'NUMERIC' || type === 'CATEGORICAL' || type === 'DATE') ? true : false;
  }

  /**
   * Check if a tree node is a study node
   * @param {TreeNode} node
   * @returns {boolean}
   */
  public isTreeNodeAstudy(node: TreeNode): boolean {
    return node['type'] === 'STUDY' ? true : false;
  }

  /**
   * Check if the tree_nodes calls are finished
   * @returns {boolean}
   */
  public isTreeNodeLoadingComplete(): boolean {
    return this.treeNodeCallsSent === this.treeNodeCallsReceived;
  }

}
