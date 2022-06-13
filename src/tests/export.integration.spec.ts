/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {DataTableService} from '../app/services/data-table.service';
import {TreeNodeService} from '../app/services/tree-node.service';
import {ExportService} from '../app/services/export.service';
import {CrossTableService} from '../app/services/cross-table.service';
import {TestBed} from '@angular/core/testing';
import {NavbarService} from '../app/services/navbar.service';
import {ConstraintService} from '../app/services/constraint.service';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {CohortService} from '../app/services/cohort.service';
import {ResourceService} from '../app/services/resource.service';
import {DatePipe} from '@angular/common';
import {CountItem} from '../app/models/aggregate-models/count-item';
import {StudyService} from '../app/services/study.service';
import {AuthenticationService} from '../app/services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../app/services/mocks/authentication.service.mock';
import {AppConfigMock} from '../app/config/app.config.mock';
import {AppConfig} from '../app/config/app.config';
import {VariableService} from '../app/services/variable.service';
import {TrueConstraint} from '../app/models/constraint-models/true-constraint';
import {CombinationConstraint} from '../app/models/constraint-models/combination-constraint';
import {TreeNode} from 'primeng/api';
import {CountService} from '../app/services/count.service';
import {Concept} from '../app/models/constraint-models/concept';
import {Constraint} from '../app/models/constraint-models/constraint';
import {Cohort} from '../app/models/cohort-models/cohort';
import {ConceptConstraint} from '../app/models/constraint-models/concept-constraint';

describe('Integration test for data export', () => {

  let resourceService: ResourceService;
  let exportService: ExportService;
  let cohortService: CohortService;
  let variableService: VariableService;
  let treeNodeService: TreeNodeService;
  let constraintService: ConstraintService;
  let countService: CountService;
  let dataTableService: DataTableService;
  const selectedTreeNodes: TreeNode[] = [
    {
      name: 'Vital Signs',
      fullName: '\\Vital Signs\\',
      type: 'UNKNOWN',
      visualAttributes: ['FOLDER', 'ACTIVE'],
      children: [{
        name: 'Heart Rate',
        fullName: '\\Vital Signs\\Heart Rate\\',
        conceptCode: 'VSIGN:HR',
        conceptPath: '\\Vital Signs\\Heart Rate\\',
        subjectCount: '6',
        type: 'NUMERIC',
        visualAttributes: ['LEAF', 'ACTIVE', 'NUMERICAL']
      } as TreeNode]
    } as TreeNode,
    {
      name: 'Not So Vital Signs',
      fullName: '\\Not So Vital Signs\\',
      type: 'UNKNOWN',
      visualAttributes: ['FOLDER', 'ACTIVE'],
      children: [{
        name: 'Random Rate',
        fullName: '\\Not So Vital Signs\\Random Rate\\',
        conceptCode: 'NSVSIGN:RR',
        conceptPath: '\\Not So Vital Signs\\Random Rate\\',
        subjectCount: '9',
        type: 'NUMERIC',
        visualAttributes: ['LEAF', 'ACTIVE', 'NUMERICAL']
      } as TreeNode]
    } as TreeNode,
    {
      name: 'Public Studies',
      fullName: '\\Public Studies\\',
      type: 'UNKNOWN',
      visualAttributes: ['CONTAINER', 'ACTIVE'],
      children: [{
        name: 'EHR',
        fullName: '\\Public Studies\\EHR\\',
        conceptPath: '\\Public Studies\\EHR\\',
        subjectCount: '3',
        type: 'STUDY',
        visualAttributes: ['LEAF', 'ACTIVE', 'STUDY'],
        children: [{
          fullName: '\\Public Studies\\EHR\\Demography\\',
          name: 'Demography',
          studyId: 'EHR',
          subjectCount: undefined,
          type: 'UNKNOWN',
          visualAttributes: ['FOLDER', 'ACTIVE'],
          children: [{
            conceptCode: 'EHR:DEM:AGE',
            conceptPath: '\\Public Studies\\EHR\\Demography\\Age\\',
            fullName: '\\Public Studies\\EHR\\Demography\\Age\\',
            name: 'Age',
            studyId: 'EHR',
            subjectCount: '3',
            type: 'NUMERIC',
            visualAttributes: ['LEAF', 'ACTIVE', 'NUMERICAL']
          } as TreeNode]
        } as TreeNode]
      } as TreeNode]
    } as TreeNode
  ];
  const heartRate = new Concept();
  heartRate.code = 'VSIGN:HR';
  heartRate.selected = true;
  const randomRate = new Concept();
  randomRate.code = 'NSVSIGN:RR';
  randomRate.selected = false;
  const age = new Concept();
  age.code = 'EHR:DEM:AGE';
  age.selected = true;
  const selectedVariables: Concept[] = [heartRate, randomRate, age];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        TreeNodeService,
        VariableService,
        CountService,
        ConstraintService,
        DataTableService,
        CrossTableService,
        ExportService,
        StudyService,
        CohortService,
        NavbarService,
        DatePipe
      ]
    });
    resourceService = TestBed.inject(ResourceService);
    exportService = TestBed.inject(ExportService);
    cohortService = TestBed.inject(CohortService);
    constraintService = TestBed.inject(ConstraintService);
    treeNodeService = TestBed.inject(TreeNodeService);
    countService = TestBed.inject(CountService);
    variableService = TestBed.inject(VariableService);
    dataTableService = TestBed.inject(DataTableService);
  });

  it('should create and run an export job', () => {
    // mock current selection count in count service
    countService.currentSelectionCount = new CountItem(10, 100);
    // mock selected tree nodes and variables in variable service
    variableService.selectedVariablesTree = selectedTreeNodes;
    variableService.variables = selectedVariables;
    // mock the root constraint in constraint service
    const rootConstraint = new CombinationConstraint();
    rootConstraint.dimension = 'patient';
    rootConstraint.addChild(new TrueConstraint());
    constraintService.rootConstraint = rootConstraint;
    let cohort = new Cohort('test1', 'test1');
    cohort.selected = true;
    cohort.constraint = new ConceptConstraint();
    cohortService.cohorts.push(cohort);
    // mock params in export service
    exportService.exportJobName = 'foobar';

    const spyRunJob = spyOn(resourceService, 'runExportJob').and.callThrough();

    exportService.prepareExportJob().then(_ => {
      expect(spyRunJob).toHaveBeenCalled();
      const combination: Constraint = variableService.combination;
      expect(combination.className).toBe('CombinationConstraint');
      // verify that there are two constraints created, based on the mocked selected tree nodes
      expect((combination as CombinationConstraint).children.length).toBe(2);
      expect((combination as CombinationConstraint).dimension).toBe('patient');
      // verify the cohort constraint
      expect((combination as CombinationConstraint).children[0].className).toBe('CombinationConstraint');
      expect(((combination as CombinationConstraint).children[0] as CombinationConstraint).children.length).toBe(2);
      // verify that combination contains selected cohort constraint
      expect(((combination as CombinationConstraint).children[0] as CombinationConstraint)
        .children[1].className).toBe('ConceptConstraint');
      // verify that the variable constraint is a combination constraint
      const variableConstraint = <CombinationConstraint>(combination as CombinationConstraint).children[1];
      expect(variableConstraint.className).toBe('CombinationConstraint');
      // verify that the variable constraint's dimension is indeed 'observation', not other dimensions that result in subselection wrapping
      expect(variableConstraint.dimension).toBe('observation');
      // verify that the variable constraint has two children, one for the heart rate and one for the age concept
      expect(variableConstraint.children.length).toBe(2);
      expect(variableConstraint.children[0]['concept'].code).toBe('VSIGN:HR');
      expect(variableConstraint.children[1]['concept'].code).toBe('EHR:DEM:AGE');
    }).catch(err => {
      fail('Preparing export job should go through, but did not. ' + err)
    });
  });

});
