import {TestBed} from '@angular/core/testing';
import {ResourceService} from '../app/services/resource.service';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {Query} from '../app/models/query-models/query';
import {ConceptConstraint} from '../app/models/constraint-models/concept-constraint';
import {ConstraintHelper} from '../app/utilities/constraint-utilities/constraint-helper';
import {ConstraintService} from '../app/services/constraint.service';
import {DataTableService} from '../app/services/data-table.service';
import {TreeNodeService} from '../app/services/tree-node.service';
import {CrossTableService} from '../app/services/cross-table.service';
import {ExportService} from '../app/services/export.service';
import {QueryService} from '../app/services/query.service';
import {AppConfig} from '../app/config/app.config';
import {AppConfigMock} from '../app/config/app.config.mock';
import {NavbarService} from '../app/services/navbar.service';
import {DatePipe} from '@angular/common';
import {StudyService} from '../app/services/study.service';
import {AuthenticationService} from '../app/services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../app/services/mocks/authentication.service.mock';

describe('Integration test for query saving and restoring', () => {

  // mocked query objects
  let q0obj = {
    bookmarked: false,
    createDate: '2018-07-02T14:47:05Z',
    dataTable: {
      columnDimensions: [],
      rowDimensions: [
        'patient',
        'study',
        'concept'
      ]
    },
    id: 'q0',
    name: 'query that stores stuff in step 1 and 2',
    observationQuery: {
      data: [
        '\\Public Studies\\Oracle_1000_Patient\\Demographics\\Age\\',
        '\\Public Studies\\Oracle_1000_Patient\\Demographics\\Gender\\',
        '\\Public Studies\\Oracle_1000_Patient\\Demographics\\'
      ]
    },
    subjectQuery: {
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
        }
      ]
    }
  };

  let q0: Query = ConstraintHelper.mapObjectToQuery(q0obj);
  let queryService: QueryService;
  let constraintService: ConstraintService;
  let dataTableService: DataTableService;
  let resourceService: ResourceService;
  let treeNodeService: TreeNodeService;

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
        QueryService,
        NavbarService,
        DatePipe
      ]
    });
    queryService = TestBed.get(QueryService);
    constraintService = TestBed.get(ConstraintService);
    dataTableService = TestBed.get(DataTableService);
    resourceService = TestBed.get(ResourceService);
    treeNodeService = TestBed.get(TreeNodeService);
  });

  it('should restore and save query in relation to other dependent services', () => {
    treeNodeService.treeNodeCallsSent = 10;
    treeNodeService.treeNodeCallsReceived = 10;
    let spy1 = spyOn(queryService, 'update_1').and.callThrough();
    let spy2 = spyOn(queryService, 'update_2').and.callThrough();
    let spy3 = spyOn(queryService, 'update_3').and.callThrough();
    let promise = queryService.restoreQuery(q0);
    expect(constraintService.rootInclusionConstraint.children.length).toEqual(2);
    let child0 = constraintService.rootInclusionConstraint.children[0];
    expect(child0.className).toEqual('ConceptConstraint');
    expect(child0['concept']).toBeDefined();
    expect(child0['concept']['code']).toEqual('SHDCSCP:DEM:AGE');
    let child1 = constraintService.rootInclusionConstraint.children[1];
    expect(child1.className).toEqual('ConceptConstraint');
    expect(child1['concept']).toBeDefined();
    expect(child1['concept']['code']).toEqual('O1KP:CAT8');
    expect(constraintService.rootExclusionConstraint.children.length).toEqual(1);
    let child3 = constraintService.rootExclusionConstraint.children[0];
    expect(child3['concept']).toBeDefined();
    expect(child3['concept']['code']).toEqual('VSIGN:HR');
    expect(queryService.query.observationQuery).toBeDefined();
    expect(queryService.query.observationQuery.data.length).toBe(3);
    promise.then(() => {
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled();
      expect(queryService.isDirty_1).toBe(false);
      expect(queryService.isDirty_2).toBe(false);
      expect(queryService.isDirty_3).toBe(false);
    });


    let spySaveQuery = spyOn(resourceService, 'saveQuery').and.callThrough();
    queryService.saveQueryByName('test-name');
    expect(queryService.queries.length).toBe(1);
    expect(queryService.isSavingQueryCompleted).toBe(true);
    expect(spySaveQuery).toHaveBeenCalled();
  });

  it('should clear queries in relation to other dependent services', () => {
    treeNodeService.treeNodeCallsSent = 10;
    treeNodeService.treeNodeCallsReceived = 10;
    queryService.restoreQuery(q0)
      .then(() => {
        queryService.clearAll()
          .then(() => {
            expect(constraintService.rootInclusionConstraint.children.length).toBe(0);
            expect(constraintService.rootExclusionConstraint.children.length).toBe(0);
            expect(treeNodeService.selectedProjectionTreeData.length).toBe(0);
          });
      });
  });

});
