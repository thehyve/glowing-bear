import {TestBed, inject} from '@angular/core/testing';

import {CrossTableService} from './cross-table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {ConstraintService} from './constraint.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';

describe('CrossTableService', () => {
  let crossTableService: CrossTableService;
  let resourceService: ResourceService;
  let constraintService: ConstraintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        CrossTableService
      ]
    });
    crossTableService = TestBed.get(CrossTableService);
    resourceService = TestBed.get(ResourceService);
    constraintService = TestBed.get(ConstraintService);
  });

  it('should be created',
    inject([CrossTableService], (service: CrossTableService) => {
      expect(service).toBeTruthy();
    }));

  it('should get crossTable', () => {
    let spy = spyOnProperty(crossTableService, 'crossTable', 'get').and.callThrough();
    expect(crossTableService.crossTable).toBeDefined();
    expect(spy).toHaveBeenCalled();
  });

  it('should get and set selectedConstraintCell', () => {
    let spyGet =
      spyOnProperty(crossTableService, 'selectedConstraintCell', 'get').and.callThrough();
    let spySet =
      spyOnProperty(crossTableService, 'selectedConstraintCell', 'set').and.callThrough();
    crossTableService.selectedConstraintCell = null;
    expect(crossTableService.selectedConstraintCell).toBe(null);
    expect(spyGet).toHaveBeenCalled();
    expect(spySet).toHaveBeenCalled();
  });

  it('should get constraints', () => {
    expect(crossTableService.rowConstraints).toBe(crossTableService.crossTable.rowConstraints);
    expect(crossTableService.columnConstraints).toBe(crossTableService.crossTable.columnConstraints);
    expect(crossTableService.valueConstraints).toBe(crossTableService.crossTable.valueConstraints);
  });

  it('should get rows and cols', () => {
    expect(crossTableService.rows).toBe(crossTableService.crossTable.rows);
    expect(crossTableService.cols).toBe(crossTableService.crossTable.cols);
  });
});
