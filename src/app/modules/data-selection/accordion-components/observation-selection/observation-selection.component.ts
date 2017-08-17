import { Component, OnInit } from '@angular/core';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';

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
  }

  onSaveObservationSetBtnClick() {
    console.log('click to save observation set with name: ', this.observationSetName);
  }
}
