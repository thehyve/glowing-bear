import { Component, OnInit } from '@angular/core';
import {Study} from "../../../shared/models/study";
import {ResourceService} from "../../../shared/services/resource.service";
import {StudyConstraint} from "../../../shared/models/constraints/study-constraint";

@Component({
  selector: 'study-constraint',
  templateUrl: './study-constraint.component.html',
  styleUrls: ['./study-constraint.component.css']
})
export class StudyConstraintComponent implements OnInit {

  private studies: Study[];
  private selectedStudy: Study;

  constructor(private resourceService: ResourceService) {
  }

  ngOnInit() {
    this.resourceService.getStudies()
      .subscribe(
        studies => this.studies = studies,
        err => console.error(err)
      );
  }

  public getConstraint() {
    return new StudyConstraint(this.selectedStudy);
  }

}
