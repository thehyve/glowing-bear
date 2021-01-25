/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
// tslint:disable-next-line:max-line-length
import {GbCombinationConstraintComponent} from '../app/modules/gb-cohort-selection-module/constraint-components/gb-combination-constraint/gb-combination-constraint.component';
// tslint:disable-next-line:max-line-length
import {GbStudyConstraintComponent} from '../app/modules/gb-cohort-selection-module/constraint-components/gb-study-constraint/gb-study-constraint.component';
// tslint:disable-next-line:max-line-length
import {GbConceptConstraintComponent} from '../app/modules/gb-cohort-selection-module/constraint-components/gb-concept-constraint/gb-concept-constraint.component';
// tslint:disable-next-line:max-line-length
import {GbPedigreeConstraintComponent} from '../app/modules/gb-cohort-selection-module/constraint-components/gb-pedigree-constraint/gb-pedigree-constraint.component';
// tslint:disable-next-line:max-line-length
import {GbSubjectSetConstraintComponent} from '../app/modules/gb-cohort-selection-module/constraint-components/gb-subject-set-constraint/gb-subject-set-constraint.component';
// tslint:disable-next-line:max-line-length
import {GbConstraintComponent} from '../app/modules/gb-cohort-selection-module/constraint-components/gb-constraint/gb-constraint.component';
import {ConstraintService} from '../app/services/constraint.service';
import {FormsModule} from '@angular/forms';
import {
  AutoCompleteModule,
  CalendarModule,
  CheckboxModule,
  DataViewModule,
  DropdownModule,
  InputSwitchModule,
  MessagesModule,
  MultiSelectModule,
  OverlayPanelModule,
  PaginatorModule,
  PanelModule,
  TreeNode,
  TreeTableModule
} from 'primeng';
import {AuthenticationService} from '../app/services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../app/services/mocks/authentication.service.mock';
import {TreeNodeService} from '../app/services/tree-node.service';
import {ResourceService} from '../app/services/resource.service';
import {CohortService} from '../app/services/cohort.service';
import {StudyService} from '../app/services/study.service';
import {CombinationConstraint} from '../app/models/constraint-models/combination-constraint';
import {CommonModule} from '@angular/common';
import {AppConfig} from '../app/config/app.config';
import {AppConfigMock} from '../app/config/app.config.mock';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {GbTreeNode} from '../app/models/tree-node-models/gb-tree-node';
import {VisualAttribute} from '../app/models/tree-node-models/visual-attribute';
import {ConceptType} from '../app/models/constraint-models/concept-type';
import {ExtendedStudyNameConstraint} from '../app/models/transmart-models/transmart-constraint';

describe('Integration tests for constraint composing', () => {
  let combiComponent: GbCombinationConstraintComponent;
  let fixture: ComponentFixture<GbCombinationConstraintComponent>;
  let constraintService: ConstraintService;
  let treeNodeService: TreeNodeService;
  let cohortService: CohortService;
  let resourceService: ResourceService;
  let event: Event = new Event('');
  let rootConstraint = new CombinationConstraint();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbConstraintComponent,
        GbStudyConstraintComponent,
        GbConceptConstraintComponent,
        GbPedigreeConstraintComponent,
        GbSubjectSetConstraintComponent,
        GbCombinationConstraintComponent
      ],
      imports: [
        CommonModule,
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule,
        PanelModule,
        DataViewModule,
        TreeTableModule,
        PaginatorModule,
        DropdownModule,
        MessagesModule,
        MultiSelectModule,
        OverlayPanelModule,
        InputSwitchModule
      ],
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        TreeNodeService,
        ConstraintService,
        CohortService,
        StudyService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    constraintService = TestBed.get(ConstraintService);
    treeNodeService = TestBed.get(TreeNodeService);
    cohortService = TestBed.get(CohortService);
    resourceService = TestBed.get(ResourceService);

    fixture = TestBed.createComponent(GbCombinationConstraintComponent);
    combiComponent = fixture.componentInstance;
    rootConstraint.children.length = 0;
    combiComponent.constraint = rootConstraint;
    fixture.detectChanges();
  });

  it('should create a combination component', () => {
    expect(combiComponent).toBeTruthy();
  });

  it('should accept drop of a study tree node', () => {
    let studyNode: TreeNode = {};
    studyNode['type'] = 'STUDY';
    studyNode['constraint'] = {
      studyId: 'foobar'
    };
    spyOnProperty(treeNodeService, 'selectedTreeNode', 'get').and.returnValue(studyNode);
    // when instantCohortUpdate is off
    cohortService.instantCohortCountsUpdate = false;
    cohortService.isDirty = false;
    combiComponent.onDrop(event);
    expect(cohortService.isDirty).toBe(true);

    // when instantCohortUpdate is on
    cohortService.instantCohortCountsUpdate = true;
    cohortService.isDirty = false;
    spyOnProperty(constraintService, 'rootConstraint', 'get')
      .and.returnValue(rootConstraint);
    combiComponent.onDrop(event);
    expect(constraintService.rootConstraint.children.length).toBe(2);
  });

  it('should accept drop of a leaf tree node without constraint field', () => {
    let node: GbTreeNode = {};
    node.visualAttributes = [VisualAttribute.NUMERICAL];
    node.name = 'name';
    node.fullName = 'full\\name';
    node.conceptCode = 'code';
    node.type = ConceptType.NUMERICAL;
    spyOnProperty(treeNodeService, 'selectedTreeNode', 'get').and.returnValue(node);
    cohortService.instantCohortCountsUpdate = true;
    cohortService.isDirty = false;
    spyOnProperty(constraintService, 'rootConstraint', 'get')
      .and.returnValue(rootConstraint);
    combiComponent.onDrop(event);
    expect(constraintService.rootConstraint.children.length).toBe(1);
  });

  it('should accept drop of a tree node with UNKNOWN type', () => {
    let node: GbTreeNode = {};
    node.type = 'UNKNOWN';
    let studyNode: GbTreeNode = {};
    studyNode.type = 'STUDY';
    studyNode.constraint = {
      type: 'study_name',
      studyId: 'foobar'
    } as ExtendedStudyNameConstraint;
    let leafNode: GbTreeNode = {};
    leafNode.visualAttributes = [VisualAttribute.CATEGORICAL];
    leafNode.name = 'name';
    leafNode.fullName = 'full\\name';
    leafNode.conceptCode = 'code';
    leafNode.type = ConceptType.CATEGORICAL;
    studyNode.children = [leafNode];
    node.children = [studyNode];
    spyOnProperty(treeNodeService, 'selectedTreeNode', 'get').and.returnValue(node);
    cohortService.instantCohortCountsUpdate = true;
    cohortService.isDirty = false;
    spyOnProperty(constraintService, 'rootConstraint', 'get')
      .and.returnValue(rootConstraint);
    combiComponent.onDrop(event);
    expect(constraintService.rootConstraint.children.length).toBe(1);
  });
});
