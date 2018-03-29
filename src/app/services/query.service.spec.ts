import {TestBed, inject} from '@angular/core/testing';

import {ConstraintService} from './constraint.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {QueryService} from './query.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {AppConfig} from "../config/app.config";
import {AppConfigMock} from "../config/app.config.mock";
import {TableServiceMock} from "./mocks/table.service.mock";
import {TableService} from "./table.service";


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
          provide: TableService,
          useClass: TableServiceMock
        },
        QueryService
      ]
    });
  });

  it('should inject QueryService', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));
});
