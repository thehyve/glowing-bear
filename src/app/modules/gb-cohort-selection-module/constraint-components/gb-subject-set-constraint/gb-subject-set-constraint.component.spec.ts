/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {GbSubjectSetConstraintComponent} from './gb-subject-set-constraint.component';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {SubjectSetConstraint} from '../../../../models/constraint-models/subject-set-constraint';
import {CohortService} from '../../../../services/cohort.service';
import {CohortServiceMock} from '../../../../services/mocks/cohort.service.mock';
import {StudyService} from '../../../../services/study.service';
import {StudyServiceMock} from '../../../../services/mocks/study.service.mock';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../../../../services/mocks/authentication.service.mock';

describe('GbSubjectSetConstraintComponent', () => {
  let component: GbSubjectSetConstraintComponent;
  let fixture: ComponentFixture<GbSubjectSetConstraintComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GbSubjectSetConstraintComponent],
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: StudyService,
          useClass: StudyServiceMock
        },
        {
          provide: CohortService,
          useClass: CohortServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbSubjectSetConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new SubjectSetConstraint();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
