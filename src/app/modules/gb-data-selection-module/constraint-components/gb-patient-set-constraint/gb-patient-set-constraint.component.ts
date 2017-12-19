import {Component, OnInit} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {PatientSetConstraint} from '../../../../models/constraints/patient-set-constraint';

@Component({
  selector: 'gb-patient-set-constraint',
  templateUrl: './gb-patient-set-constraint.component.html',
  styleUrls: ['./gb-patient-set-constraint.component.css']
})
export class GbPatientSetConstraintComponent extends GbConstraintComponent implements OnInit {

  message = '';

  ngOnInit() {
    let psConstraint = (<PatientSetConstraint>this.constraint);
    if (psConstraint.subjectIds.length > 0) {
      this.message += `constrained with ${psConstraint.subjectIds.length} external subject IDs.`;
    } else if (psConstraint.patientIds.length > 0) {
      this.message += `constrained with ${psConstraint.patientIds.length} internal subject IDs.`;
    } else if (psConstraint.id) {
      this.message += `constrained with the patient-set ID: ${psConstraint.id}`;
    }
  }

}
