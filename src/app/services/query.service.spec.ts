import {TestBed, inject} from '@angular/core/testing';

import {ConstraintService} from './constraint.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {QueryService} from './query.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {AppConfig} from '../config/app.config';
import {AppConfigMock} from '../config/app.config.mock';
import {DataTableServiceMock} from './mocks/data-table.service.mock';
import {DataTableService} from './data-table.service';
import {ExportService} from './export.service';
import {ExportServiceMock} from './mocks/export.service.mock';
import {MessageService} from './message.service';
import {MessageServiceMock} from './mocks/message.service.mock';
import {CrossTableService} from './cross-table.service';
import {CrossTableServiceMock} from './mocks/cross-table.service.mock';


describe('QueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
        },
        {
          provide: ExportService,
          useClass: ExportServiceMock
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        },
        QueryService
      ]
    });
  });

  it('should be injected', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));


});
