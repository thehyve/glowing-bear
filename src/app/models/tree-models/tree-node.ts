import {TreeNode as PrimeNgTreeNode} from 'primeng/api';
import {DropMode} from '../drop-mode';
import {ConceptType} from '../constraint-models/concept-type';
import {TreeNodeType} from './tree-node-type';

export class TreeNode implements PrimeNgTreeNode {

  // --- fields for GB logic
  path: string;
  name: string;
  displayName: string;
  description: string;

  // type of node (concept, study, ...)
  nodeType: TreeNodeType;
  // type of concept if node is a concept
  conceptType: ConceptType;
  conceptCode: string;
  dropMode: DropMode;
  metadata: object;
  // depth of the node in the tree
  depth: number;
  // constraint (possibly undefined) associated with this node
  constraint: object;
  // study id (possibly undefined) associated with this node
  studyId: string;
  // number of subject (possibly undefined) associated with this node
  subjectCount: number;


  // flag to signal if the children were requested to the backend
  childrenAttached: boolean;

  // --- fields for PrimeNg TreeNode logic
  children: TreeNode[];
  icon: string;
  label: string;
  expandedIcon: string;
  collapsedIcon: string;
  leaf: boolean;
  expanded: boolean;
  styleClass: string;
  parent: TreeNode;
  partialSelected: boolean;

  /**
   * Returns true if children were attached and at least 1 is present.
   * @returns {boolean}
   */
  hasChildren(): boolean {
    return this.childrenAttached && this.children.length > 0;
  }

  /**
   * Returns true if 'this' is a parent of 'node'.
   *
   * @param {TreeNode} node
   * @returns {boolean}
   */
  isParentOf(node: TreeNode): boolean {
    return node.path.startsWith(this.path) &&
      node.path.length > this.path.length;
  }

  /**
   * Generate the tree structure based on the path of the children treeNodes and attach it to the current node.
   * Note: this will consume the treeNodes array.
   *
   * @param {TreeNode[]} treeNodes
   */
  attachChildTree(treeNodes: TreeNode[]) {

    // generate tree structure inside the array
    for (let i = 0 ; i < treeNodes.length ; i++) {
      if (treeNodes[i] === undefined) {
        continue;
      }

      for (let j = i + 1 ; j < treeNodes.length ; j++) {
        if (treeNodes[i] === undefined) {
          break;
        }
        if (treeNodes[j] === undefined) {
          continue;
        }

        if (treeNodes[i].isParentOf(treeNodes[j])) {
          treeNodes[i].children.push(treeNodes[j]);
          treeNodes[j] = undefined;

        } else if (treeNodes[j].isParentOf(treeNodes[i])) {
          treeNodes[j].children.push(treeNodes[i]);
          treeNodes[i] = undefined;
        }
      }
    }

    // attach it to the parent
    for (let treeNode of treeNodes) {
      if (treeNode !== undefined) {
        if (this.isParentOf(treeNode)) {
          this.children.push(treeNode);
        } else {
          console.warn(`Isolated tree node, possible error, this: ${this.path}, treeNode: ${treeNode.path}`);
        }
      }
    }

    this.childrenAttached = true;
  }
}
