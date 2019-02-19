/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {SubjectSetConstraint} from '../../../../models/constraint-models/subject-set-constraint';

@Component({
  selector: 'gb-subject-set-constraint',
  templateUrl: './gb-subject-set-constraint.component.html',
  styleUrls: ['./gb-subject-set-constraint.component.css']
})
export class GbSubjectSetConstraintComponent extends GbConstraintComponent implements OnInit {

  message = '';

  ngOnInit() {
    let psConstraint = (<SubjectSetConstraint>this.constraint);
    if (psConstraint.subjectIds.length > 0) {
      this.message += `constrained with ${psConstraint.subjectIds.length} external subject IDs.`;
    } else if (psConstraint.patientIds.length > 0) {
      this.message += `constrained with ${psConstraint.patientIds.length} internal subject IDs.`;
    } else if (psConstraint.id) {
      this.message += `constrained with the patient-set ID: ${psConstraint.id}`;
    }
  }

}
