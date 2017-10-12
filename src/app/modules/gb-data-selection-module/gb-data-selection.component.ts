import {Component, OnInit} from '@angular/core';
import {TreeNodeService} from '../../services/tree-node.service';
import {ConstraintService} from '../../services/constraint.service';

@Component({
  selector: 'gb-data-selection',
  templateUrl: './gb-data-selection.component.html',
  styleUrls: ['./gb-data-selection.component.css']
})
export class GbDataSelectionComponent implements OnInit {

  private _queryName: string;

  constructor(private treeNodeService: TreeNodeService,
              public constraintService: ConstraintService) {
    this.queryName = '';
  }

  ngOnInit() {
    this.treeNodeService.treeSelectionMode = '';
  }

  /**
   * The event handler for the accordion tab open event
   * @param event
   */
  openAccordion(event) {
    // if the 'select observation' accordion is opened,
    // set tree selection mode to checkbox on the left side
    // else set to empty string
    this.treeNodeService.treeSelectionMode = event.index === 1 ? 'checkbox' : '';
  }

  /**
   * The event handler for the accordion tab close event
   * @param event
   */
  closeAccordion(event) {
    // if the 'select observation' accordion is closed,
    // set treeSelectionMode to empty string
    if (event.index === 1) {
      this.treeNodeService.treeSelectionMode = '';
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
      this.queryName = '';
    } else {
      const summary = 'Please specify the query name.';
      this.constraintService.alertMessages.length = 0;
      this.constraintService.alertMessages.push({severity: 'warn', summary: summary, detail: ''});
    }
  }

  numberWithCommas(x: number): string {
    if (x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      return '0';
    }

  }

  public singularOrPlural(noun: string, number: string) {
    if (number === '1' || number === '0') {
      return noun;
    } else if (noun === 'study') {
      return 'studies';
    } else {
      return noun + 's';
    }
  }

  get patientCount(): string {
    return this.numberWithCommas(this.constraintService.patientCount);
  }

  get patientObservationCount(): string {
    return this.numberWithCommas(this.constraintService.patientObservationCount);
  }

  get patientConceptCount(): string {
    return this.numberWithCommas(this.constraintService.patientConceptCount);
  }

  get patientStudyCount(): string {
    return this.numberWithCommas(this.constraintService.patientStudyCount);
  }

  get observationCount(): string {
    return this.numberWithCommas(this.constraintService.observationCount);
  }

  get conceptCount(): string {
    if (this.constraintService.conceptCount > 0) {
      return this.numberWithCommas(this.constraintService.conceptCount);
    } else {
      return this.numberWithCommas(this.treeNodeService.concepts.length);
    }
  }

  get queryName(): string {
    return this._queryName;
  }

  set queryName(value: string) {
    this._queryName = value;
  }
}
