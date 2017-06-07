import {Component, OnInit, ViewChild} from '@angular/core';
import {Study} from "../../../shared/models/study";
import {StudyConstraint} from "../../../shared/models/constraints/study-constraint";
import {ConstraintComponent} from "../constraint/constraint.component";
import {AutoComplete} from "primeng/components/autocomplete/autocomplete";

@Component({
  selector: 'study-constraint',
  templateUrl: './study-constraint.component.html',
  styleUrls: ['./study-constraint.component.css', '../constraint/constraint.component.css']
})
export class StudyConstraintComponent extends ConstraintComponent implements OnInit {

  @ViewChild('autoComplete') autoComplete: AutoComplete;

  searchResults: Study[];

  ngOnInit() {
  }

  get selectedStudies(): Study[] {
    return (<StudyConstraint>this.constraint).studies;
  }

  set selectedStudies(value: Study[]) {
    (<StudyConstraint>this.constraint).studies = value;
  }

  onSearch(event) {
    let query = event.query.toLowerCase();
    let studies = this.dimensionRegistry.getStudies();
    if (query) {
      this.searchResults = studies.filter((study: Study) => study.studyId.toLowerCase().includes(query));
    }
    else {
      this.searchResults = studies;
    }
  }

  onDropdown(event) {
    let studies = this.dimensionRegistry.getStudies();

    // Workaround for dropdown not showing properly, as described in
    // https://github.com/primefaces/primeng/issues/745
    this.searchResults = [];
    this.searchResults = studies;
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    if (this.autoComplete.panelVisible) {
      this.autoComplete.hide();
    } else {
      this.autoComplete.show();
    }
  }

  onUnselect(studyObject) {
    // For some funny reason, the study is still in the list when this handler is invoked
    let index = this.selectedStudies.indexOf(studyObject);
    this.selectedStudies.splice(index, 1);
    this.constraintService.update();
  }

  updateStudies(studyObject) {
    this.constraintService.update();
  }

}
