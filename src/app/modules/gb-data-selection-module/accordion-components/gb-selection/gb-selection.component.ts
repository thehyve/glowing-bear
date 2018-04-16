import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {
  trigger, style, animate, transition
} from '@angular/animations';
import {GbConstraintComponent} from '../../constraint-components/gb-constraint/gb-constraint.component';
import {CombinationConstraint} from '../../../../models/constraint-models/combination-constraint';
import {QueryService} from '../../../../services/query.service';
import {ConstraintService} from '../../../../services/constraint.service';
import {Step} from '../../../../models/query-models/step';
import {FormatHelper} from '../../../../utilities/FormatHelper';
import {Query} from '../../../../models/query-models/query';

type LoadingState = 'loading' | 'complete';

@Component({
  selector: 'gb-selection',
  templateUrl: './gb-selection.component.html',
  styleUrls: ['./gb-selection.component.css'],
  animations: [
    trigger('notifyState', [
      transition('loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 0.5)'
        }),
        animate('1000ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class GbSelectionComponent implements OnInit {

  @ViewChild('rootInclusionConstraintComponent') rootInclusionConstraintComponent: GbConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent') rootExclusionConstraintComponent: GbConstraintComponent;

  private isUploadListenerNotAdded: boolean;

  constructor(private constraintService: ConstraintService,
              private queryService: QueryService) {
    this.isUploadListenerNotAdded = true;
  }

  ngOnInit() {
  }

  get subjectCount_1(): string {
    return FormatHelper.formatCountNumber(this.queryService.subjectCount_1);
  }

  get inclusionSubjectCount(): string {
    return FormatHelper.formatCountNumber(this.queryService.inclusionSubjectCount);
  }

  get exclusionSubjectCount(): string {
    return FormatHelper.formatCountNumber(this.queryService.exclusionSubjectCount);
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootInclusionConstraint;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootExclusionConstraint;
  }

  clearCriteria() {
    this.queryService.step = Step.I;
    this.constraintService.clearSelectionConstraint();
    this.queryService.update_1();
  }

  importCriteria() {
    let uploadElm = document.getElementById('step1CriteriaFileUpload');
    if (this.isUploadListenerNotAdded) {
      uploadElm
        .addEventListener('change', this.criteriaFileUpload.bind(this), false);
      this.isUploadListenerNotAdded = false;
      // reset the input path so that it will take the same file again
      document.getElementById('step1CriteriaFileUpload')['value'] = '';
    }
    uploadElm.click();
  }

  criteriaFileUpload(event) {
    let reader = new FileReader();
    let file = event.target.files[0];
    reader.onload = (function (e) {
      let data = e.target['result'];
      let query = this.parseFile(file, data);
      this.queryService.restoreQuery(query);
    }).bind(this);
    reader.readAsText(file);
  }

  private parseFile(file: File, data: any): Query {
    let patientsQuery = {};
    if (file.type === 'text/plain' ||
      file.type === 'text/tab-separated-values' ||
      file.type === 'text/csv' ||
      (file.type === '' && file.name.split('.').pop() !== 'json')) {
      // we assume the text contains a list of subject Ids
      let subjectIds: string[] = data.split(/(\r\n)+/)
        .map(id => id.trim())
        .filter(id => id.length > 0);
      patientsQuery = {
        'type': 'patient_set',
        'subjectIds': subjectIds
      };
    } else if (file.type === 'application/json' || file.name.split('.').pop() === 'json') {
      let _json = JSON.parse(data);
      // If the json is of standard format
      if (_json['patientsQuery']) {
        patientsQuery = _json['patientsQuery'];
      } else {
        const msg = 'Invalid file content for query import.';
        this.queryService.alert(msg, '', 'error');
        return;
      }
    } else {
      const msg = 'Invalid file format for STEP 1.';
      this.queryService.alert(msg, '', 'error');
      return;
    }
    let name = file.name.substr(0, file.name.indexOf('.'));
    let query = new Query('', name);
    query.patientsQuery = patientsQuery;
    return query;
  }

  get loadingStateInclusion(): LoadingState {
    return this.queryService.loadingStateInclusion;
  }

  get loadingStateExclusion(): LoadingState {
    return this.queryService.loadingStateExclusion;
  }

  get loadingStateTotal_1(): LoadingState {
    return this.queryService.loadingStateTotal_1;
  }

}
