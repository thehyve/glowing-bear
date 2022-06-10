/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed} from '@angular/core/testing';
import {ResourceService} from '../app/services/resource.service';
import {of as observableOf} from 'rxjs';
import {TransmartTableState} from '../app/models/transmart-models/transmart-table-state';
import {Constraint} from '../app/models/constraint-models/constraint';
import {DataTableService} from '../app/services/data-table.service';
import {ConstraintServiceMock} from '../app/services/mocks/constraint.service.mock';
import {ConstraintService} from '../app/services/constraint.service';
import {StudyService} from '../app/services/study.service';
import {AppConfig} from '../app/config/app.config';
import {AppConfigMock} from '../app/config/app.config.mock';
import {TransmartHttpService} from '../app/services/http/transmart-http.service';
import {TransmartHttpServiceMock} from '../app/services/mocks/transmart-http.service.mock';
import {TransmartResourceService} from '../app/services/transmart-resource.service';
import {TransmartPackerHttpService} from '../app/services/http/transmart-packer-http.service';
import {TransmartPackerHttpServiceMock} from '../app/services/mocks/transmart-packer-http.service.mock';
import {GbBackendHttpService} from '../app/services/http/gb-backend-http.service';
import {GbBackendHttpServiceMock} from '../app/services/mocks/gb-backend-http.service.mock';
import {VariableService} from '../app/services/variable.service';
import {VariableServiceMock} from '../app/services/mocks/variable.service.mock';
import {TransmartDataTable} from "../app/models/transmart-models/transmart-data-table";
import {TransmartSort} from "../app/models/transmart-models/transmart-sort";
import {Order} from "../app/models/table-models/order";
import Spy = jasmine.Spy;

const dimElements01 = new Map([
  ['TNS:DEM:AGE', new Map([
    ['conceptCode', 'TNS:DEM:AGE'],
    ['conceptPath', '\\Public Studies\\TUMOR_NORMAL_SAMPLES\\Demography\\Age\\'],
    ['label', 'TNS:DEM:AGE'],
    ['name', 'Age']
  ])
  ]]);

const rowElements = new Map([
  ['-43/TNS:43', new Map<string, Object>([
    ['age', 52],
    ['birthDate', null],
    ['deathDate', null],
    ['id', -43],
    ['inTrialId', '3'],
    ['label', '-43/TNS,43'],
    ['maritalStatus', null],
    ['race', 'Caucasian'],
    ['religion', null],
    ['sex', 'female'],
    ['sexCd', 'Female']])
  ],
  ['-53/TNS:53', new Map<string, Object>([
    ['age', 42],
    ['birthDate', null],
    ['deathDate', null],
    ['id', -53],
    ['inTrialId', '2'],
    ['label', '-53/TNS,53'],
    ['maritalStatus', null],
    ['race', 'Latino'],
    ['religion', null],
    ['sex', 'male'],
    ['sexCd', 'Male']
  ])]
]);

const mockResponseData: TransmartDataTable = {
  'columnDimensions': [
    {
      'name': 'concept',
      'elements': dimElements01
    }
  ],
  'columnHeaders': [{
    'dimension': 'concept',
    'keys': ['TNS:DEM:AGE', 'TNS:HD:EXPBREAST', 'TNS:HD:EXPBREAST', 'TNS:HD:EXPLUNG', 'TNS:HD:EXPLUNG',
      'TNS:LAB:CELLCNT', 'TNS:LAB:CELLCNT'],
    'elements': []
  }, {
    'dimension': 'sample_type',
    'keys': [],
    'elements': [null, 'Normal', 'Tumor', 'Normal', 'Tumor', 'Normal', 'Tumor']
  }],
  'offset': 0,
  'rowCount': 3,
  'rowDimensions': [{
    'elements': rowElements,
    'name': 'patient'
  }],
  'rows': [{
    'cells': [40, null, 'sample3', 'sample1', 'sample2', 203, 100],
    'rowHeaders': [{
      'dimension': 'patient',
      'key': -63
    }]
  }, {
    'cells': [42, null, 'sample5', null, 'sample4', 180, 80],
    'rowHeaders': [{
      'dimension': 'patient',
      'key': -53
    }]
  }, {
    'cells': [52, 'sample9', null, ['sample7', 'sample8'], 'sample6', [380, 240], 28],
    'rowHeaders': [{
      'dimension': 'patient',
      'key': -43
    }]
  }],
  'sort': [new TransmartSort(
    'patient', Order.ASC),
    new TransmartSort(
      'concept', Order.ASC)]
};


/**
 * Test suite that tests the data table functionality, by calling
 * functions on the data table service (which holds the data table data structure),
 * and checking if the expected calls are being made to the tranSMART resource service.
 */
describe('Integration test data table retrieval calls for TranSMART', () => {
  let dataTableService: DataTableService;
  let resourceService: ResourceService;
  let transmartResourceService: TransmartResourceService;
  let transmartHttpService: TransmartHttpService;
  let dataTableCall: Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TransmartHttpService,
          useClass: TransmartHttpServiceMock
        },
        {
          provide: TransmartPackerHttpService,
          useClass: TransmartPackerHttpServiceMock
        },
        {
          provide: GbBackendHttpService,
          useClass: GbBackendHttpServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: VariableService,
          useClass: VariableServiceMock
        },
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        ResourceService,
        TransmartResourceService,
        StudyService,
        DataTableService
      ]
    });
    resourceService = TestBed.inject(ResourceService);
    transmartHttpService = TestBed.inject(TransmartHttpService);
    transmartResourceService = TestBed.inject(TransmartResourceService);
    dataTableService = TestBed.inject(DataTableService);
  });

  it('should load data table data on initialisation', async () => {
    dataTableCall = spyOn(transmartHttpService, 'getDataTable')
      .and.callFake((tableState: TransmartTableState,
                     constraint: Constraint,
                     offset: number, limit: number) => {
        return observableOf(mockResponseData);
      });
    let studyIdsCall = spyOn(transmartHttpService, 'getStudyIds')
      .and.callFake((constraint: Constraint) => {
        return observableOf(['s1', 's2'])
      });

    await dataTableService.updateDataTable();

    /**
     * After the studies have been loaded, and the data table service has been initialised ...
     * The sequence of calls goes as follows:
     * variable.service:variablesUpdated ->
     * data-table.service:updateDataTable ->
     * resource.service:getDataTable ->
     * transmart-resource.service:getDataTable ->
     * transmart-resource.service:getDimensions ->
     * transmart-resource.service:getStudyIds ->
     * transmart-http.service:getStudyIds
     */
    resourceService.getStudies().subscribe(() => {

      // the table should be updated.
      expect(studyIdsCall).toHaveBeenCalled();
      expect(dataTableCall).toHaveBeenCalled();
      expect(dataTableService.rows.length).toEqual(5);
    }, err => {});
  });

});
