import {Component, OnInit, ViewChild} from '@angular/core';
import {Study} from "../../../shared/models/study";
import {StudyConstraint} from "../../../shared/models/constraints/study-constraint";
import {ConstraintComponent} from "../constraint/constraint.component";
import {AutoComplete} from "primeng/components/autocomplete/autocomplete";
import {DimensionRegistryService} from "../../../shared/services/dimension-registry.service";

@Component({
  selector: 'study-constraint',
  templateUrl: './study-constraint.component.html',
  styleUrls: ['./study-constraint.component.css', '../constraint/constraint.component.css']
})
export class StudyConstraintComponent extends ConstraintComponent implements OnInit  {

  @ViewChild('autoComplete') autoComplete: AutoComplete;

  searchResults: Study[];

  constructor(private dimensionRegistry:DimensionRegistryService) {
    super();
  }

  ngOnInit() {
  }

  get selectedStudy():Study {
    return (<StudyConstraint>this.constraint).study;
  }

  set selectedStudy(value:Study) {
    (<StudyConstraint>this.constraint).study = value;
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

}
