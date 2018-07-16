/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbStudyConstraintComponent} from './gb-study-constraint.component';
import {AutoCompleteModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {StudyConstraint} from '../../../../models/constraint-models/study-constraint';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {QueryService} from '../../../../services/query.service';
import {Study} from '../../../../models/constraint-models/study';

describe('GbStudyConstraintComponent', () => {
  let component: GbStudyConstraintComponent;
  let fixture: ComponentFixture<GbStudyConstraintComponent>;
  let constraintService: ConstraintService;
  let treeNodeService: TreeNodeService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbStudyConstraintComponent],
      imports: [
        FormsModule,
        AutoCompleteModule
      ],
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
          provide: QueryService,
          useClass: QueryServiceMock
        }
      ]
    })
      .compileComponents();
    constraintService = TestBed.get(ConstraintService);
    treeNodeService = TestBed.get(TreeNodeService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbStudyConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new StudyConstraint();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should prepare suggested studies for dropdown', () => {
    let dummies = [
      new Study(),
      new Study()
    ];
    let e = new MouseEvent('');
    e['originalEvent'] = new MouseEvent('');
    let spy1 = spyOnProperty(constraintService, 'studies', 'get').and.returnValue(dummies);
    component.onDropdown(e);
    expect(spy1).toHaveBeenCalled();
    expect(component.searchResults).toBe(dummies);
  })

  it('should handle the drop of a study constraint', () => {
    let studyConstraint1 = new StudyConstraint();
    let study1 = new Study(); study1.id = 'id1';
    studyConstraint1.studies = [study1];
    let studyConstraint2 = new StudyConstraint();
    let study2 = new Study(); study2.id = 'id2';
    studyConstraint2.studies = [study2];
    let spy1 = spyOn(constraintService, 'generateConstraintFromTreeNode').and.returnValue(studyConstraint1);
    treeNodeService.selectedTreeNode = {}
    treeNodeService.selectedTreeNode['dropMode'] = '';
    component.constraint = studyConstraint2;
    let e = new DragEvent('drag');
    component.onDrop(e);
    expect(spy1).toHaveBeenCalled();
    expect((<StudyConstraint>component.constraint).studies.length).toEqual(2);

    treeNodeService.selectedTreeNode = {}
    treeNodeService.selectedTreeNode['dropMode'] = '';
    component.onDrop(e);
    expect((<StudyConstraint>component.constraint).studies.length).toEqual(2);
  })

  it('should handle dropped constraint being null', () => {
    let spy1 = spyOn(constraintService, 'generateConstraintFromTreeNode').and.returnValue(null);
    treeNodeService.selectedTreeNode = {}
    treeNodeService.selectedTreeNode['dropMode'] = '';
    let studyConstraint2 = new StudyConstraint();
    let study2 = new Study(); study2.id = 'id2';
    studyConstraint2.studies = [study2];
    component.constraint = studyConstraint2;
    let e = new DragEvent('drag');
    component.onDrop(e);
    expect((<StudyConstraint>component.constraint).studies.length).toEqual(1);
  })

  it('should search studies', () => {
    let event = {
      query: 'aBc'
    };
    let study1 = new Study(); study1.id = 'id1';
    let study2 = new Study(); study2.id = 'id2';
    let study3 = new Study(); study3.id = 'abc';
    constraintService.studies =  [study1, study2, study3];
    component.onSearch(event);
    expect(component.searchResults.length).toEqual(1);

    event.query = 'id';
    component.onSearch(event);
    expect(component.searchResults.length).toEqual(2);

    event.query = '';
    component.onSearch(event);
    expect(component.searchResults.length).toEqual(3);
  })

});
