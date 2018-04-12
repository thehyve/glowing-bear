
import {ConstraintService} from '../constraint.service';

export class TreeNodeServiceMock {
  treeSelectionMode = '';

  constructor() {
  }

  public loadTreeNodes(constraintService: ConstraintService) {
  }

  public isTreeNodeLoadingComplete(): boolean {
    return true;
  }
}
