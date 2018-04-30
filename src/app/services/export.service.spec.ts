import {TestBed, inject} from '@angular/core/testing';

import {ExportService} from './export.service';
import {ConstraintService} from './constraint.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TableService} from './table.service';
import {TableServiceMock} from './mocks/table.service.mock';
import {MessageService} from './message.service';
import {MessageServiceMock} from './mocks/message.service.mock';

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
          provide: TableService,
          useClass: TableServiceMock
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        },
        ExportService
      ]
    });
  });

  it('should be injected', inject([ExportService], (service: ExportService) => {
    expect(service).toBeTruthy();
  }));
});
