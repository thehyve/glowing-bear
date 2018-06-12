import {TestBed, inject, async} from '@angular/core/testing';

import {ResourceService} from './resource.service';
import {EndpointService} from './endpoint.service';
import {EndpointServiceMock} from './mocks/endpoint.service.mock';
import {TransmartResourceService} from './transmart-services/transmart-resource.service';
import {TransmartResourceServiceMock} from './mocks/transmart-resource.service.mock';
import {MessageService} from './message.service';
import {MessageServiceMock} from './mocks/message.service.mock';
import {HttpErrorResponse, HttpHeaders} from '@angular/common/http';

describe('ResourceService', () => {
  let resourceService: ResourceService;
  let transmartResourceService: TransmartResourceService;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourceService,
        {
          provide: EndpointService,
          useClass: EndpointServiceMock
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        },
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        }
      ]
    });
    resourceService = TestBed.get(ResourceService);
    transmartResourceService = TestBed.get(TransmartResourceService);
    messageService = TestBed.get(MessageService)
  });

  it('should be injected', inject([ResourceService], (service: ResourceService) => {
    expect(service).toBeTruthy();
  }));

  it('should handle error', () => {
    let res: HttpErrorResponse = new HttpErrorResponse({
      error: 'error',
      headers: null,
      status: 404,
      statusText: 'status text',
      url: 'url'
    });
    spyOn(console, 'error').and.stub();
    spyOn(messageService, 'alert').and.stub();
    resourceService.handleError(res);
    const status = res['status'];
    const url = res['url'];
    const message = res['message'];
    const summary = `Status: ${status}\nurl: ${url}\nMessage: ${message}`;
    expect(console.error).toHaveBeenCalledWith(summary);
    expect(console.error).toHaveBeenCalledWith(res['error']);
    expect(messageService.alert).toHaveBeenCalled();
  })

  it('should log out', () => {
    spyOn(transmartResourceService, 'logout').and.stub();
    resourceService.logout();
    expect(transmartResourceService.logout).toHaveBeenCalled();
  })

});
