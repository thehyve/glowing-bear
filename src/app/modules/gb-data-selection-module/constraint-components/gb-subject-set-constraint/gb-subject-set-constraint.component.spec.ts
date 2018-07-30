/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {GbSubjectSetConstraintComponent} from './gb-subject-set-constraint.component';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {SubjectSetConstraint} from '../../../../models/constraint-models/subject-set-constraint';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {StudiesService} from '../../../../services/studies.service';
import {StudiesServiceMock} from '../../../../services/mocks/studies.service.mock';

describe('GbSubjectSetConstraintComponent', () => {
  let component: GbSubjectSetConstraintComponent;
  let fixture: ComponentFixture<GbSubjectSetConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbSubjectSetConstraintComponent],
      providers: [
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
          provide: StudiesService,
          useClass: StudiesServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
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
