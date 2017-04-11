import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";
import {WorkflowService} from "../../../shared/services/workflow.service";
import {TrueConstraint} from "../../../shared/models/constraints/true-constraint";
import {ConstraintComponent} from "../../constraint-components/constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {ConceptConstraint} from "../../../shared/models/constraints/concept-constraint";


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
    this.rootConstraint.addChildConstraint(new ConceptConstraint());
    this.rootConstraint.addChildConstraint(new ConceptConstraint());
    let combo = new CombinationConstraint();
    combo.addChildConstraint(new ConceptConstraint());
    this.rootConstraint.addChildConstraint(combo);
  }

  ngOnInit() {
  }

  runPatientQuery() {
    // let constraint = this.rootConstraint.getConstraint();
    let constraint = new TrueConstraint();
    this.resourceService.getPatients(constraint)
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
    let trueConstraint = new TrueConstraint();
    this.resourceService.savePatients(name, trueConstraint)
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
