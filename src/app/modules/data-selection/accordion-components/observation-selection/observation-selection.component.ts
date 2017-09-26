import {Component, OnInit} from '@angular/core';
import {DimensionRegistryService} from '../../../../services/dimension-registry.service';

@Component({
  selector: 'observation-selection',
  templateUrl: './observation-selection.component.html',
  styleUrls: ['./observation-selection.component.css']
})
export class ObservationSelectionComponent implements OnInit {

  observationSetName = '';

  constructor(public dimensionRegistryService: DimensionRegistryService) {
  }

  ngOnInit() {
    this.updateObservationFileChooserEventListener();
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
      let nodes = this.dimensionRegistryService.treeNodes;
      this.dimensionRegistryService.findTreeNodesByPaths(nodes, paths, foundTreeNodes);
      this.dimensionRegistryService.updateSelectedTreeNodesPrime(foundTreeNodes);
    }).bind(this);
    let file = event.target.files[0];
    console.log('file: ', file);
    reader.readAsText(file);
  }

  onSaveObservationSetBtnClick() {
    console.log('click to save observation set with name: ', this.observationSetName);
  }
}
