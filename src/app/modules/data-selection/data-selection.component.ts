import {Component, OnInit} from '@angular/core';
import {DimensionRegistryService} from '../shared/services/dimension-registry.service';

@Component({
  selector: 'data-selection',
  templateUrl: './data-selection.component.html',
  styleUrls: ['./data-selection.component.css']
})
export class DataSelectionComponent implements OnInit {

  constructor(private dimensionRegistryService: DimensionRegistryService) {
  }

  ngOnInit() {
    this.dimensionRegistryService.treeSelectionMode = 'checkbox';
  }

  /**
   * The event handler for the accordion tab open event
   * @param event
   */
  openAccordion(event) {
    // if the 'select observation' accordion is opened,
    // set tree selection mode to checkbox on the left side
    // else set to empty string
    this.dimensionRegistryService.treeSelectionMode = event.index === 1 ? 'checkbox' : '';
  }

  /**
   * The event handler for the accordion tab close event
   * @param event
   */
  closeAccordion(event) {
    // if the 'select observation' accordion is closed,
    // set treeSelectionMode to empty string
    if (event.index === 1) {
      this.dimensionRegistryService.treeSelectionMode = '';
    }
  }

}
