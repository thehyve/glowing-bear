import {Component, OnInit} from '@angular/core';
import {TreeNodeService} from '../../services/tree-node.service';
import {ConstraintService} from '../../services/constraint.service';
import {PatientSetConstraint} from "../../models/constraints/patient-set-constraint";

@Component({
  selector: 'gb-data-selection',
  templateUrl: './gb-data-selection.component.html',
  styleUrls: ['./gb-data-selection.component.css']
})
export class GbDataSelectionComponent implements OnInit {

  private _queryName: string;

  constructor(public constraintService: ConstraintService) {
    this.queryName = '';
  }

  ngOnInit() {
    this.updateEventListeners();
  }

  updateEventListeners() {
    document
      .getElementById('queryFileUpload')
      .addEventListener('change', this.queryFileUpload.bind(this), false);
  }

  /**
   * The event handler for the accordion tab open event,
   * to access the accordion, use event.index
   * @param event
   */
  openAccordion(event) {
  }

  /**
   * The event handler for the accordion tab close event,
   * to access the accordion, use event.index
   * @param event
   */
  closeAccordion(event) {
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

  importQuery() {
    document.getElementById('queryFileUpload').click();
  }

  queryFileUpload(event) {
    let reader = new FileReader();
    let file = event.target.files[0];
    reader.onload = (function (e) {
      if (file.type === 'application/json') {
        let json = JSON.parse(e.target['result']);
        let pathArray = null;
        // If the json is of standard format
        if (json['patientsQuery'] || json['observationsQuery']) {
          this.constraintService.putQuery(json);
        } else if (json['paths']) {
          pathArray = json['paths'];
        } else if (json.constructor === Array) {
          pathArray = json;
        }

        if (pathArray) {
          let query = {
            'name': 'imported temporary query',
            'patientsQuery': {'type': 'true'},
            'observationsQuery': {
              data: pathArray
            }
          };
          this.constraintService.putQuery(query);
          this.constraintService.alert('Imported concept selection in Step 2.', '', 'info');
        }
      } else if (file.type === 'text/plain' ||
        file.type === 'text/tab-separated-values' ||
        file.type === 'text/csv' ||
        file.type === '') {
        // we assume the text contains a list of subject Ids
        let query = {
          'name': 'imported temporary query',
          'patientsQuery': {
            'type': 'patient_set',
            'subjectIds': e.target['result'].split('\n')
          },
          'observationsQuery': {}
        };
        this.constraintService.putQuery(query);
        this.constraintService.alert('Imported subject selection in Step 1.', '', 'info');
      }

      // reset the input path so that it will take the same file again
      document.getElementById('queryFileUpload')['value'] = '';
    }).bind(this);
    reader.readAsText(file);
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

  get patientCount_1(): string {
    return this.numberWithCommas(this.constraintService.patientCount_1);
  }

  get observationCount_1(): string {
    return this.numberWithCommas(this.constraintService.observationCount_1);
  }

  get conceptCount_1(): string {
    return this.numberWithCommas(this.constraintService.conceptCount_1);
  }

  get studyCount_1(): string {
    return this.numberWithCommas(this.constraintService.studyCount_1);
  }

  get patientCount_2(): string {
    return this.numberWithCommas(this.constraintService.patientCount_2);
  }

  get isLoadingPatientCount_2(): boolean {
    return this.constraintService.isLoadingPatientCount_2;
  }

  get observationCount_2(): string {
    return this.numberWithCommas(this.constraintService.observationCount_2);
  }

  get isLoadingObservationCount_2(): boolean {
    return this.constraintService.isLoadingObservationCount_2;
  }

  get conceptCount_2(): string {
    return this.numberWithCommas(this.constraintService.conceptCount_2);
  }

  get isLoadingConceptCount_2(): boolean {
    return this.constraintService.isLoadingConceptCount_2;
  }

  get studyCount_2(): string {
    return this.numberWithCommas(this.constraintService.studyCount_2);
  }

  get isLoadingStudyCount_2(): boolean {
    return this.constraintService.isLoadingStudyCount_2;
  }

  get queryName(): string {
    return this._queryName;
  }

  set queryName(value: string) {
    this._queryName = value;
  }
}
