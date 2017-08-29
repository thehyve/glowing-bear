import {Injectable} from '@angular/core';
import {ResourceService} from './resource.service';
import {Study} from '../models/study';
import {Constraint} from '../models/constraints/constraint';
import {Concept} from '../models/concept';
import {StudyConstraint} from '../models/constraints/study-constraint';
import {ConceptConstraint} from '../models/constraints/concept-constraint';
import {CombinationConstraint} from '../models/constraints/combination-constraint';
import {SavedSet} from '../models/saved-set';
import {TreeNode} from 'primeng/primeng';

type LoadingState = 'loading' | 'complete';

@Injectable()
export class DimensionRegistryService {

  // the variable that holds the entire tree structure
  public treeNodes: TreeNode[] = [];
  // the selectionMode of the tree, default is '', alternative is 'checkbox'
  public treeSelectionMode = '';
  // the selected tree nodes by user in observation selection
  public selectedTreeNodes: TreeNode[] = [];
  // the PrimeNg version of selected tree nodes, an alternative version of selectedTreeNodes
  // this version is specifically used to store the selected tree nodes checked by the user
  // it does not retain the origin tree structure, but could give us information
  // it is used by the tree-nodes.component
  public selectedTreeNodesPrime: TreeNode[] = [];
  // the status indicating the when the tree is being loaded or finished loading
  public loadingTreeNodes: LoadingState = 'complete';
  private studies: Study[] = [];
  private studyConstraints: Constraint[] = [];
  private concepts: Concept[] = [];
  private conceptConstraints: Constraint[] = [];

  private patientSets: SavedSet[] = [];
  private observationSets: SavedSet[] = [];

  // List keeping track of all available constraints. By default, the empty
  // constraints are in here. In addition, (partially) filled constraints are
  // added. The constraints should be copied when editing them.
  private allConstraints: Constraint[] = [];

  constructor(private resourceService: ResourceService) {
    this.updateEmptyConstraints();
    this.updateStudies();
    this.updateConcepts();
    this.updatePatientSets();
  }

  updateEmptyConstraints() {
    this.allConstraints.push(new CombinationConstraint());
    this.allConstraints.push(new StudyConstraint());
    this.allConstraints.push(new ConceptConstraint());
  }

  updateStudies() {
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

  loadTreeNext(parentNode) {
    this.resourceService.getTreeNodes(parentNode['fullName'], 2, true, true)
      .subscribe(
        (treeNodes: object[]) => {
          const refNode = treeNodes && treeNodes.length > 0 ? treeNodes[0] : undefined;
          const children = refNode ? refNode['children'] : undefined;
          if (children) {
            parentNode['children'] = children;
            this.processTreeNode(parentNode);
            children.forEach((function (node) {
              this.loadTreeNext(node);
            }).bind(this));
          }
        },
        err => console.error(err)
      );
  }

  /** Extracts concepts (and later possibly other dimensions) from the
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
    }
  }

  private processTreeNode(node: Object) {
    // Extract concept
    if (node['dimension'] === 'concept') {

      // Only include non-FOLDERs and non-CONTAINERs
      if (node['visualAttributes'].indexOf('FOLDER') === -1 &&
        node['visualAttributes'].indexOf('CONTAINER') === -1) {

        let concept = new Concept();
        // TODO: retrieve concept path in less hacky manner:
        let path = node['constraint']['path'];
        concept.path = path ? path : node['fullName'];
        concept.type = node['type'];
        this.concepts.push(concept);

        let constraint = new ConceptConstraint();
        constraint.concept = concept;
        this.conceptConstraints.push(constraint);
        this.allConstraints.push(constraint);
      }
    }
    // Add PrimeNG visual properties for tree nodes
    let patientCount = node['patientCount'];
    let countStr = ' ';
    if (patientCount) {
      countStr += '(' + patientCount;
    }
    // let observationCount = node['observationCount'];
    // if (observationCount) {
    //   countStr += ' | ' + observationCount;
    // }
    if (countStr !== ' ') {
      countStr += ')';
    }
    node['label'] = node['name'] + countStr;
    if (node['metadata']) {
      node['label'] = node['label'] + ' ⚆';
    }

    // If this node has children, drill down
    if (node['children']) {
      // Recurse
      node['expandedIcon'] = 'fa-folder-open';
      node['collapsedIcon'] = 'fa-folder';
      node['icon'] = '';
      this.processTreeNodes(node['children']);
    } else {
      if (node['type'] === 'NUMERIC') {
        node['icon'] = 'icon-123';
      } else if (node['type'] === 'HIGH_DIMENSIONAL') {
        node['icon'] = 'icon-hd';
      } else if (node['type'] === 'CATEGORICAL_OPTION') {
        node['icon'] = 'icon-abc';
      } else {
        node['icon'] = 'fa-folder-o';
      }
    }
  }

  updateConcepts() {
    this.loadingTreeNodes = 'loading';
    // Retrieve all tree nodes and extract the concepts iteratively
    this.resourceService.getTreeNodes('\\', 2, false, true)
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
   * Update the selected tree nodes
   */
  public updateSelectedTreeNodes() {
    this.selectedTreeNodes.length = 0;
    for (let treeNode of this.treeNodes) {
      const isSelected = this.selectedTreeNodesPrime.indexOf(treeNode) !== -1;
      const isPartiallySelected = treeNode['partialSelected'];
      if (isSelected || isPartiallySelected) {
        let treeNodeCopy = Object.assign({}, treeNode);
        this.keepSelectedTreeNodes(treeNodeCopy);
        this.selectedTreeNodes.push(treeNodeCopy);
      }
    }
  }

  private keepSelectedTreeNodes(parentNode: TreeNode) {
    // parentNode.parent = undefined;
    let children = parentNode['children'];
    if (children) {
      let selectedChildren = [];
      for (let child of children) {
        const isChildSelected = this.selectedTreeNodesPrime.indexOf(child) !== -1;
        const isChildPartiallySelected = child['partialSelected'];
        if (isChildSelected || isChildPartiallySelected) {
          let childCopy = Object.assign({}, child);
          this.keepSelectedTreeNodes(childCopy);
          selectedChildren.push(childCopy);
        }
      }
      parentNode['children'] = selectedChildren;
    }
  }

  /**
   * Update the PrimeNG version of selected tree nodes
   */
  public updateSelectedTreeNodesPrime(nodes: TreeNode[]) {
    for (let node of nodes) {
      if (this.selectedTreeNodesPrime.indexOf(node) === -1) {
        node['expanded'] = true;
        node['isSelected'] = true;
        let ancestors = this.findTreeNodeAncestors(node);
        for (let ancestor of ancestors) {
          ancestor['expanded'] = true;
          ancestor['partialSelected'] = true;
        }
        this.selectedTreeNodesPrime.push(node);
      }
    }
    this.updateSelectedTreeNodes();
  }

  /**
   * Find the tree nodes that have the fullNames (i.e. tree paths) in the given paths
   * @param {TreeNode[]} nodes
   * @param {string[]} paths
   * @param {TreeNode[]} foundNodes
   */
  private findTreeNodesByPaths(nodes: TreeNode[], paths: string[], foundNodes: TreeNode[]) {
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
   * Update the patient sets, used for the saved patient set panel on the left
   */
  updatePatientSets() {
    // reset patient sets
    this.resourceService.getPatientSets()
      .subscribe(
        sets => {
          // this is to retain the original reference pointer to the array
          this.patientSets.length = 0;

          // reverse the sets so that the latest patient set is on top
          sets.reverse();
          sets.forEach(set => {
            set.name = set.description;
            this.patientSets.push(set);
          });
        },
        err => console.error(err)
      );
  }

  getStudies() {
    return this.studies;
  }

  getConcepts() {
    return this.concepts;
  }

  getPatientSets() {
    return this.patientSets;
  }

  getObservationSets() {
    return this.observationSets;
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

}
