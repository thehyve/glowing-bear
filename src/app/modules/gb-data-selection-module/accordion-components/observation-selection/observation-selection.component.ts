import {Component, OnInit} from '@angular/core';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {ConstraintService} from '../../../../services/constraint.service';

@Component({
  selector: 'observation-selection',
  templateUrl: './observation-selection.component.html',
  styleUrls: ['./observation-selection.component.css']
})
export class ObservationSelectionComponent implements OnInit {

  constructor(public treeNodeService: TreeNodeService,
              public constraintService: ConstraintService) {
  }

  ngOnInit() {
    this.updateObservationFileChooserEventListener();
    this.constraintService.updateObservationCounts();
  }

  updateObservationFileChooserEventListener() {
    document
      .getElementById('observationFileChooser')
      .addEventListener('change', this.onObservationFileChooserClick.bind(this), false);
  }

  onObservationFileChooserClick(event) {
    let reader = new FileReader();
    reader.onload = (function (e) {
      let paths = JSON.parse(e.target['result']);
      let foundTreeNodes = [];
      let nodes = this.treeNodeService.treeNodes;
      this.treeNodeService.findTreeNodesByPaths(nodes, paths, foundTreeNodes);
      this.treeNodeService.updateSelectedTreeNodesPrime(foundTreeNodes);
    }).bind(this);
    let file = event.target.files[0];
    console.log('file: ', file);
    reader.readAsText(file);
  }

}
