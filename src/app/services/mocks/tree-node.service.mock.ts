import {ConstraintService} from '../constraint.service';
import {TreeNode} from 'primeng/primeng';

export class TreeNodeServiceMock {
  // the variable that holds the entire tree structure, used by the tree on the left
  public treeNodes: TreeNode[] = [];
  // the copy of the tree nodes that is used for constructing the tree in the 2nd step (projection)
  public treeNodesCopy: TreeNode[] = [];
  // the entire tree table data that holds the patients' observations in the 2nd step (projection)
  private _projectionTreeData: TreeNode[] = [];
  // the selected tree table data that holds the patients' observations in the 2nd step (projection)
  private _selectedProjectionTreeData: TreeNode[] = [];
  // the final tree nodes resulted from data selection
  private _finalTreeNodes: TreeNode[] = [];

  public treeNodeCallsSent = 0; // the number of tree-node calls sent
  public treeNodeCallsReceived = 0; // the number of tree-node calls received

  private _validTreeNodeTypes: string[] = [];

  constructor() {
    this._validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL',
      'DATE',
      'STUDY',
      'TEXT',
      'HIGH_DIMENSIONAL',
      'UNKNOWN'
    ];
  }

  public loadTreeNodes(constraintService: ConstraintService) {
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

  public isTreeNodeLoadingComplete(): boolean {
    return true;
  }

  public updateProjectionTreeData(conceptCountMap: object, checklist: Array<string>) {
  }

  get finalTreeNodes(): TreeNode[] {
    return this._finalTreeNodes;
  }

  set finalTreeNodes(value: TreeNode[]) {
    this._finalTreeNodes = value;
  }

}
