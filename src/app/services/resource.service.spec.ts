import {TestBed, inject, async} from '@angular/core/testing';

import {ResourceService} from './resource.service';
import {EndpointService} from './endpoint.service';
import {EndpointServiceMock} from './mocks/endpoint.service.mock';
import {TransmartResourceService} from './transmart-resource/transmart-resource.service';
import {TransmartResourceServiceMock} from './mocks/transmart-resource.service.mock';

fdescribe('ResourceService', () => {
  let resourceService: ResourceService;
  let transmartResourceService: TransmartResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourceService,
        {
          provide: EndpointService,
          useClass: EndpointServiceMock
        },
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        }
      ]
    });
    resourceService = TestBed.get(ResourceService);
    transmartResourceService = TestBed.get(TransmartResourceService);
  });

  it('should be injected', inject([ResourceService], (service: ResourceService) => {
    expect(service).toBeTruthy();
  }));

  it('should handle error', () => {
    let res = {
      status: 'status',
      url: 'url',
      message: 'message',
      error: 'error'
    }
    spyOn(console, 'error').and.stub();
    resourceService.handleError(res);
    const status = res['status'];
    const url = res['url'];
    const message = res['message'];
    const summary = `Status: ${status}\nurl: ${url}\nMessage: ${message}`;
    expect(console.error).toHaveBeenCalledWith(summary);
    expect(console.error).toHaveBeenCalledWith(res['error']);
  })

  it('should log out', () => {
    spyOn(transmartResourceService, 'logout').and.stub();
    resourceService.logout();
    expect(transmartResourceService.logout).toHaveBeenCalled();
  })
  
});
