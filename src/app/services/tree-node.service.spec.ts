import {TestBed, inject} from '@angular/core/testing';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TreeNodeService} from './tree-node.service';
import {NavbarService} from './navbar.service';
import {NavbarServiceMock} from './mocks/navbar.service.mock';

describe('TreeNodeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        TreeNodeService
      ]
    });
  });

  it('TreeNodeService should be injected', inject([TreeNodeService], (service: TreeNodeService) => {
    expect(service).toBeTruthy();
  }));
});
