import {Component, OnInit} from '@angular/core';
import {DimensionRegistryService} from '../../services/dimension-registry.service';
import {ConstraintService} from '../../services/constraint.service';

@Component({
  selector: 'data-selection',
  templateUrl: './data-selection.component.html',
  styleUrls: ['./data-selection.component.css']
})
export class DataSelectionComponent implements OnInit {

  private _queryName: string;

  constructor(private dimensionRegistryService: DimensionRegistryService,
              public constraintService: ConstraintService) {
    this.queryName = '';
  }

  ngOnInit() {
    this.dimensionRegistryService.treeSelectionMode = '';
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

  /**
   * Prevent the default behavior of node drop
   * @param event
   */
  preventNodeDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  saveQuery() {
    let name = this.queryName ? this.queryName.trim() : '';
    let queryNameIsValid = name !== '';
    if (queryNameIsValid) {
      this.constraintService.saveQuery(name);
    } else {
      const summary = 'Please specify the query name.';
      this.constraintService.alertMessages.length = 0;
      this.constraintService.alertMessages.push({severity: 'warn', summary: summary, detail: ''});
    }
  }

  numberWithCommas(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  get patientCount(): string {
    return this.numberWithCommas(this.constraintService.patientCount);
  }

  get observationCount(): string {
    return this.numberWithCommas(this.constraintService.observationCount);
  }

  get conceptCount(): string {
    if (this.constraintService.conceptCount > 0) {
      return this.numberWithCommas(this.constraintService.conceptCount);
    } else {
      return this.numberWithCommas(this.dimensionRegistryService.concepts.length);
    }
  }

  get queryName(): string {
    return this._queryName;
  }

  set queryName(value: string) {
    this._queryName = value;
  }
}
