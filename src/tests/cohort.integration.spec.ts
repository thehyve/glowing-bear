/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {TestBed} from '@angular/core/testing';
import {ResourceService} from '../app/services/resource.service';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {Cohort} from '../app/models/cohort-models/cohort';
import {ConceptConstraint} from '../app/models/constraint-models/concept-constraint';
import {ConstraintService} from '../app/services/constraint.service';
import {DataTableService} from '../app/services/data-table.service';
import {TreeNodeService} from '../app/services/tree-node.service';
import {CrossTableService} from '../app/services/cross-table.service';
import {ExportService} from '../app/services/export.service';
import {CohortService} from '../app/services/cohort.service';
import {AppConfig} from '../app/config/app.config';
import {AppConfigMock} from '../app/config/app.config.mock';
import {NavbarService} from '../app/services/navbar.service';
import {DatePipe} from '@angular/common';
import {StudyService} from '../app/services/study.service';
import {AuthenticationService} from '../app/services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../app/services/mocks/authentication.service.mock';
import {SubjectSetConstraint} from '../app/models/constraint-models/subject-set-constraint';
import {CombinationConstraint} from '../app/models/constraint-models/combination-constraint';
import {CountService} from '../app/services/count.service';
import {
  TransmartAndConstraint, TransmartConceptConstraint,
  TransmartNegationConstraint,
  TransmartSubSelectionConstraint
} from '../app/models/transmart-models/transmart-constraint';
import {CohortMapper} from '../app/utilities/cohort-utilities/cohort-mapper';
import {CohortRepresentation} from '../app/models/gb-backend-models/cohort-representation';
import {TransmartConstraintMapper} from '../app/utilities/transmart-utilities/transmart-constraint-mapper';
import {ConceptType} from '../app/models/constraint-models/concept-type';
import {CombinationState} from '../app/models/constraint-models/combination-state';
import {Concept} from '../app/models/constraint-models/concept';

describe('Integration test for cohort saving and restoring', () => {

  // mocked cohort objects
  const q0obj: CohortRepresentation = {
    bookmarked: false,
    subscribed: false,
    createDate: '2018-07-02T14:47:05Z',
    id: 'q0',
    name: 'cohort that stores stuff',
    subjectDimension: 'patient',
    queryBlob: {
      queryConstraintFull: {
        type: 'and',
        args: [
          {
            type: 'or',
            args: [
              {
                type: 'and',
                args: [
                  {
                    conceptCode: 'SHDCSCP:DEM:AGE',
                    conceptPath: '\\Private Studies\\SHARED_HD_CONCEPTS_STUDY_C_PR\\Demography\\Age\\',
                    fullName: '\\Private Studies\\SHARED_HD_CONCEPTS_STUDY_C_PR\\Demography\\Age\\',
                    name: 'age',
                    type: 'concept',
                    valueType: 'NUMERIC'
                  },
                  {
                    operation: '<=',
                    type: 'value',
                    value: 35,
                    valueType: 'NUMERIC'
                  }
                ]
              },
              {
                type: 'and',
                args: [
                  {
                    conceptCode: 'O1KP:CAT8',
                    conceptPath: '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_8\\',
                    fullName: '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_8\\',
                    name: 'categorical_8',
                    type: 'concept',
                    valueType: 'CATEGORICAL'
                  },
                  {
                    type: 'or',
                    args: [
                      {
                        type: 'value',
                        valueType: 'STRING',
                        operator: '=',
                        value: 'Heart'
                      },
                      {
                        type: 'value',
                        valueType: 'STRING',
                        operator: '=',
                        value: 'Liver'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: 'negation',
            arg: {
              type: 'and',
              args: [
                {
                  conceptCode: 'VSIGN:HR',
                  conceptPath: '\\Vital Signs\\Heart Rate\\',
                  fullName: '\\Private Studies\\SHARED_CONCEPTS_STUDY_C_PRIV\\Vital Signs\\Heart Rate\\',
                  name: 'Heart Rate',
                  type: 'concept',
                  valueType: 'NUMERIC'
                },
                {
                  operation: '=',
                  type: 'value',
                  value: 60,
                  valueType: 'NUMERIC'
                }
              ]
            }
          } as TransmartNegationConstraint
        ]
      } as TransmartAndConstraint
    }
  };

  let q0: Cohort = CohortMapper.deserialise(q0obj);
  let cohortService: CohortService;
  let constraintService: ConstraintService;
  let dataTableService: DataTableService;
  let resourceService: ResourceService;
  let treeNodeService: TreeNodeService;
  let countService: CountService;

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
        ConstraintService,
        DataTableService,
        CrossTableService,
        ExportService,
        StudyService,
        CohortService,
        NavbarService,
        DatePipe,
        CountService
      ]
    });
    cohortService = TestBed.get(CohortService);
    constraintService = TestBed.get(ConstraintService);
    dataTableService = TestBed.get(DataTableService);
    resourceService = TestBed.get(ResourceService);
    treeNodeService = TestBed.get(TreeNodeService);
    countService = TestBed.get(CountService);
  });

  it('should restore and save query in relation to other dependent services', () => {
    cohortService.saveSubjectSetBeforeUpdatingCounts = false;
    treeNodeService.treeNodeCallsSent = 10;
    treeNodeService.treeNodeCallsReceived = 10;
    let spy1 = spyOn(cohortService, 'updateCountsWithCurrentCohort').and.callThrough();
    let spy2 = spyOn(resourceService, 'saveSubjectSet').and.callThrough();
    let promise = cohortService.restoreCohort(q0);
    expect(constraintService.rootConstraint.children.length).toEqual(2);

    let child0 = constraintService.rootConstraint.children[0];
    expect(child0.className).toEqual('CombinationConstraint');

    let child01 = (<CombinationConstraint>child0).children[0];
    expect(child01.className).toEqual('ConceptConstraint');
    expect(child01['concept']).toBeDefined();
    expect(child01['concept']['code']).toEqual('SHDCSCP:DEM:AGE');
    expect(child01['negated']).toEqual(false);

    let child02 = (<CombinationConstraint>child0).children[1];
    expect(child02.className).toEqual('ConceptConstraint');
    expect(child02['concept']).toBeDefined();
    expect(child02['concept']['code']).toEqual('O1KP:CAT8');
    expect(child02['negated']).toEqual(false);

    let child03 = constraintService.rootConstraint.children[1];
    expect(child03.className).toEqual('ConceptConstraint');
    expect(child03['concept']).toBeDefined();
    expect(child03['concept']['code']).toEqual('VSIGN:HR');
    expect(child03['negated']).toEqual(true);

    promise.then(() => {
      expect(spy1).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      expect(cohortService.isDirty).toBe(false);
    });


    let spySave = spyOn(resourceService, 'saveCohort').and.callThrough();
    cohortService.saveCohortByName('test-name');
    expect(cohortService.cohorts.length).toBe(2);
    expect(cohortService.isSavingCohortCompleted).toBe(true);
    expect(spySave).toHaveBeenCalled();
  });

  it('should restore cohort containing diagnosis constraint', (done) => {
    const tumorTypeConstraint = new ConceptConstraint();
    const tumorTypeConcept = new Concept();
    tumorTypeConcept.code = 'CODE:TUMOR_TYPE';
    tumorTypeConcept.type = ConceptType.CATEGORICAL;
    tumorTypeConstraint.concept = tumorTypeConcept;
    // Diagnosis set
    const diagnosisCombination = new CombinationConstraint(
      [tumorTypeConstraint], CombinationState.And, 'diagnosis');
    const patientsWithDiagnosis = new CombinationConstraint(
      [diagnosisCombination], CombinationState.And, 'patient');
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'patient',
      constraint: {
        type: 'subselection',
        dimension: 'diagnosis',
        constraint: {
          type: 'concept',
          conceptCode: 'CODE:TUMOR_TYPE'
        } as TransmartConceptConstraint
      } as TransmartSubSelectionConstraint
    };

    const patientsWithDiagnosisSerialised = TransmartConstraintMapper.mapConstraint(patientsWithDiagnosis);
    expect(JSON.stringify(patientsWithDiagnosisSerialised, null, 2))
      .toEqual(JSON.stringify(expected, null, 2));

    const patientsWithDiagnosisCohort = new Cohort('', 'Patients with diagnosis');
    patientsWithDiagnosisCohort.constraint = patientsWithDiagnosis;
    cohortService.cohorts.push(patientsWithDiagnosisCohort);

    cohortService.restoreCohort(patientsWithDiagnosisCohort)
      .then(() => {
        const currentCohortConstraint = TransmartConstraintMapper.mapConstraint(cohortService.allSelectedCohortsConstraint);
        expect(JSON.stringify(currentCohortConstraint, null, 2))
          .toEqual(JSON.stringify(expected, null, 2));

        expect(cohortService.cohorts.length).toBe(2);

        cohortService.currentCohort.selected = false;
        patientsWithDiagnosisCohort.selected = true;
        const selectedCohortConstraint = TransmartConstraintMapper.mapConstraint(cohortService.allSelectedCohortsConstraint);
        expect(JSON.stringify(selectedCohortConstraint, null, 2))
          .toEqual(JSON.stringify(expected, null, 2));

        done();
      })
      .catch(err => {
        console.error(err);
        fail('Should have successfully restored the cohort with diagnosis constraint');
        done();
      });
  });

  it('should restore cohort containing subject set constraint', () => {
    let target = new Cohort(null, 'test');
    let subjectSetConstraint = new SubjectSetConstraint();
    subjectSetConstraint.subjectIds = ['1', '2', '3'];
    target.constraint = subjectSetConstraint;
    cohortService.restoreCohort(target)
      .catch(err => {
        fail('should have successfully restored the cohort with subject-set constraint but not')
      });
  });

  it('should save subject set before updating counts', () => {
    cohortService.saveSubjectSetBeforeUpdatingCounts = true;
    let spy1 = spyOn(resourceService, 'saveSubjectSet').and.callThrough();
    let spy2 = spyOn(countService, 'updateAllCounts').and.callThrough();

    let promise = cohortService.updateCountsWithAllCohorts();
    promise.then(() => {
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith(jasmine.any(SubjectSetConstraint));
      expect(cohortService.isDirty).toBe(false);
    });
  });

});
