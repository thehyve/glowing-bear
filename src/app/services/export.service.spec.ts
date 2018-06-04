import {TestBed, inject} from '@angular/core/testing';

import {ExportService} from './export.service';
import {ConstraintService} from './constraint.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {DataTableService} from './data-table.service';
import {DataTableServiceMock} from './mocks/data-table.service.mock';
import {MessageService} from './message.service';
import {MessageServiceMock} from './mocks/message.service.mock';
import {DatePipe} from '@angular/common';

describe('ExportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        },
        ExportService,
        DatePipe
      ]
    });
  });

  it('should be injected', inject([ExportService], (service: ExportService) => {
    expect(service).toBeTruthy();
  }));
});
