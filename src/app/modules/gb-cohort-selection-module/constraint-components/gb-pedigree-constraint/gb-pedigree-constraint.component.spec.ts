/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbPedigreeConstraintComponent} from './gb-pedigree-constraint.component';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {CheckboxModule, DropdownModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {PedigreeConstraint} from '../../../../models/constraint-models/pedigree-constraint';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CohortServiceMock} from '../../../../services/mocks/cohort.service.mock';
import {CohortService} from '../../../../services/cohort.service';
import {MockComponent} from 'ng2-mock-component';
import {StudyService} from '../../../../services/study.service';
import {StudyServiceMock} from '../../../../services/mocks/study.service.mock';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../../../../services/mocks/authentication.service.mock';

describe('GbPedigreeConstraintComponent', () => {
  let component: GbPedigreeConstraintComponent;
  let fixture: ComponentFixture<GbPedigreeConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbPedigreeConstraintComponent,
        MockComponent({selector: 'gb-combination-constraint', inputs: ['constraint']})
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        DropdownModule,
        CheckboxModule
      ],
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
          provide: CohortService,
          useClass: CohortServiceMock
        },
        {
          provide: StudyService,
          useClass: StudyServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbPedigreeConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new PedigreeConstraint('PAR');
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
