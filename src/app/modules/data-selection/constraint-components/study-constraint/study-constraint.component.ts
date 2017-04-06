import { Component, OnInit } from '@angular/core';
import {Study} from "../../../shared/models/study";
import {ResourceService} from "../../../shared/services/resource.service";

@Component({
  selector: 'study-constraint',
  templateUrl: './study-constraint.component.html',
  styleUrls: ['./study-constraint.component.css']
})
export class StudyConstraintComponent implements OnInit {

  private studies: Study[];

  constructor(private resourceService: ResourceService) {
  }

  ngOnInit() {
    this.resourceService.getStudies()
      .subscribe(
        studies => this.studies = studies,
        err => console.error(err)
      );
  }

}
