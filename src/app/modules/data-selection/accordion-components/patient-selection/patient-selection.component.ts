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


@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css']
})
export class PatientSelectionComponent implements OnInit {
  patientCount: number;
  responseMessage: string;

  rootConstraint: CombinationConstraint;
  @ViewChild('rootConstraintComponent') rootConstraintComponent: ConstraintComponent;

  constructor(private resourceService: ResourceService,
              private workflowService: WorkflowService) {
    this.patientCount = 0;
    this.responseMessage = "";


    this.rootConstraint = new CombinationConstraint();
    this.rootConstraint.children.push(new StudyConstraint());
    this.rootConstraint.children.push(new StudyConstraint());
    let combo = new CombinationConstraint();
    combo.children.push(new ConceptConstraint());
    this.rootConstraint.children.push(combo);
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
    let name = 'test_patient_set';
    this.resourceService.savePatients(name, this.rootConstraint)
      .subscribe(
        result => {
          this.responseMessage = JSON.stringify(result);
        },
        err => {
          console.error(err);
        }
      );
  }



}
