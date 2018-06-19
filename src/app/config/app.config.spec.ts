import {TestBed, inject} from '@angular/core/testing';
import {AppConfig} from './app.config';
import {HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MessageHelper} from '../utilities/message-helper';
import {Observable} from 'rxjs/Observable';

describe('AppConfig', () => {
  let appConfig: AppConfig;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        AppConfig
      ]
    });
    appConfig = TestBed.get(AppConfig);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be injected', inject([AppConfig], (service: AppConfig) => {
    expect(service).toBeTruthy();
  }));

  it('should get the config value with its key, return null if absent', () => {
    appConfig.config = {
      foo: 'bar'
    };
    let val = appConfig.getConfig('foo');
    expect(val).toBe('bar');
    val = appConfig.getConfig('sth else');
    expect(val).toBe(null);
    val = appConfig.getConfig('sth else', 'custom value');
    expect(val).toBe('custom value');
  })

  it('should get the env from config', () => {
    appConfig.env = {
      env: 'foobar'
    };
    let val = appConfig.getEnv();
    expect(val).toBe('foobar');
  })

  it('should load the correct config json file', () => {
    AppConfig.path = 'somepath/';
    let dummyEnvResponse = {
      env: 'dev',
      foo: 'bar'
    };
    let dummyConfigResponse = {
      bar: 'foo'
    };
    let spy = spyOn(appConfig.http, 'get').and.callThrough();
    let spyMessage = spyOn(MessageHelper, 'alert');
    appConfig.load();
    httpMock.expectOne(AppConfig.path + 'env.json').flush(dummyEnvResponse);
    httpMock.expectOne(AppConfig.path + 'config.' + dummyEnvResponse.env + '.json').flush(dummyConfigResponse);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spyMessage).toHaveBeenCalledTimes(0);
  })

  it('should not load config file when env is wrong', () => {
    AppConfig.path = 'somepath/';
    let dummyEnvResponse = {
      env: 'sth.wrong',
      foo: 'bar'
    };
    let dummyConfigResponse = {
      bar: 'foo'
    };
    let spy = spyOn(appConfig.http, 'get').and.callThrough();
    let spyMessage = spyOn(MessageHelper, 'alert');
    appConfig.load();
    httpMock.expectOne(AppConfig.path + 'env.json').flush(dummyEnvResponse);
    httpMock.expectNone(AppConfig.path + 'config.' + dummyEnvResponse.env + '.json');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyMessage).toHaveBeenCalledTimes(1);
  })

  it('should report error when retrieving env.json fails', () => {
    let errorResponse = {
      status: 404,
      statusText: 'bad request'
    };
    AppConfig.path = 'somepath/';
    let spy = spyOn(appConfig.http, 'get').and.callThrough();
    let spyMessage = spyOn(MessageHelper, 'alert');
    appConfig.load();
    httpMock.expectOne(AppConfig.path + 'env.json').flush('cannot load env json', errorResponse);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyMessage).toHaveBeenCalledTimes(1);
  })

  it('should report error  when retrieving config json fails', () => {
    AppConfig.path = 'somepath/';
    let dummyEnvResponse = {
      env: 'dev',
      foo: 'bar'
    };
    let errorResponse = {
      status: 404,
      statusText: 'bad request'
    };
    let spy = spyOn(appConfig.http, 'get').and.callThrough();
    let spyMessage = spyOn(MessageHelper, 'alert');
    appConfig.load();
    httpMock.expectOne(AppConfig.path + 'env.json').flush(dummyEnvResponse);
    httpMock.expectOne(AppConfig.path + 'config.' + dummyEnvResponse.env + '.json')
      .flush('cannot load config json', errorResponse);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spyMessage).toHaveBeenCalledTimes(1);
  })
});
