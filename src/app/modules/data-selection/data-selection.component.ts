import {Component, OnInit} from '@angular/core';
import {DimensionRegistryService} from '../../services/dimension-registry.service';
import {ConstraintService} from '../../services/constraint.service';
import {ResourceService} from '../../services/resource.service';

@Component({
  selector: 'data-selection',
  templateUrl: './data-selection.component.html',
  styleUrls: ['./data-selection.component.css']
})
export class DataSelectionComponent implements OnInit {

  private _queryName: string;

  constructor(private dimensionRegistryService: DimensionRegistryService,
              private resourceService: ResourceService,
              private constraintService: ConstraintService) {
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
    let queryNameIsValid = this.queryName !== '';
    if (queryNameIsValid) {
      const patientConstraintObj = this.constraintService.getPatientConstraint().toPatientQueryObject();
      const observationConstraintObj = this.constraintService.getObservationConstraint().toQueryObject();
      const queryObj = {
        name: this.queryName,
        patientsQuery: patientConstraintObj,
        observationsQuery: observationConstraintObj,
        bookmarked: false
      };
      this.resourceService.saveQuery(queryObj)
        .subscribe(
          (newlySavedQuery) => {
            this.dimensionRegistryService.queries.push(newlySavedQuery);
          },
          err => console.error(err)
        );
    } else {
      console.log('query name is empty');
    }
  }

  get patientCount(): number {
    return this.constraintService.patientCount;
  }

  get observationCount(): number {
    return this.constraintService.observationCount;
  }

  get conceptCount(): number {
    return this.constraintService.conceptCount;
  }

  get queryName(): string {
    return this._queryName;
  }

  set queryName(value: string) {
    this._queryName = value;
  }
}
