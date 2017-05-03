import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";
import {WorkflowService} from "../../../shared/services/workflow.service";
import {TrueConstraint} from "../../../shared/models/constraints/true-constraint";
import {ConstraintComponent} from "../../constraint-components/constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {ConceptConstraint} from "../../../shared/models/constraints/concept-constraint";
import {StudyConstraint} from "../../../shared/models/constraints/study-constraint";
import {PatientSetPostResponse} from "../../../shared/models/patient-set-post-response";


@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css']
})
export class PatientSelectionComponent implements OnInit {

  patientCount: number = 0;
  patientSetName: string = "";
  patientSetPostResponse: PatientSetPostResponse = null;
  rootConstraint: CombinationConstraint = new CombinationConstraint();
  @ViewChild('rootConstraintComponent') rootConstraintComponent: ConstraintComponent;

  constructor(private resourceService: ResourceService,
              private workflowService: WorkflowService) {
  }

  ngOnInit() {
  }

  runPatientQuery() {
    this.resourceService.getPatients(this.rootConstraint)
      .subscribe(
        patients => {
          this.patientCount = patients.length;
        },
        err => {
          console.error(err);
        }
      );
  }

  savePatientSet() {
    this.resourceService.savePatients(this.patientSetName, this.rootConstraint)
      .subscribe(
        result => {
          this.patientSetPostResponse = result;
        },
        err => {
          console.error(err);
        }
      );
  }



}
