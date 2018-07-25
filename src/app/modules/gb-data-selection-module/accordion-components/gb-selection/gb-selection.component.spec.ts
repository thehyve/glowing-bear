/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbSelectionComponent} from './gb-selection.component';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CalendarModule, CheckboxModule, MessagesModule} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {MockComponent} from 'ng2-mock-component';
import {SubjectSetConstraint} from '../../../../models/constraint-models/subject-set-constraint';

describe('GbSelectionComponent', () => {
  let component: GbSelectionComponent;
  let fixture: ComponentFixture<GbSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbSelectionComponent,
        MockComponent({selector: 'gb-constraint', inputs: ['constraint', 'isRoot']})
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule,
        MessagesModule
      ],
      providers: [
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
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
    fixture = TestBed.createComponent(GbSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('GbSelectionComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should process uploaded subject ids', () => {
    let fileContents = 'id123\nid456\n';
    let query = GbSelectionComponent.processSubjectIdsUpload(fileContents, 'testName');
    expect(query).toBeDefined();
    expect(query.name).toEqual('testName');
    expect(query.subjectQuery.className).toEqual('SubjectSetConstraint');
    expect((<SubjectSetConstraint>query.subjectQuery).subjectIds.length).toEqual(2);
  });
});
