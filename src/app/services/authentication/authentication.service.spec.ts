import {inject, TestBed} from '@angular/core/testing';

import {AuthenticationService} from './authentication.service';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock, OidcConfigMock} from '../../config/app.config.mock';
import {Oauth2Authentication} from './oauth2-authentication';
import {routing} from '../../app.routing';
import {GbMainModule} from '../../modules/gb-main-module/gb-main.module';
import {APP_BASE_HREF} from '@angular/common';
import {AuthorisationResult} from './authorisation-result';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('Oauth2Authentication with Transmart service type', () => {
  let config: AppConfig;
  let authenticationService: AuthenticationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        GbMainModule,
        HttpClientTestingModule,
        routing
      ],
      providers: [
        AuthenticationService,
        Oauth2Authentication,
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        }
      ]
    });
    config = TestBed.get(AppConfig);
    authenticationService = TestBed.get(AuthenticationService);
    httpMock = TestBed.get(HttpTestingController);
    spyOn(history, 'replaceState').and.callFake((data, title, url) => {});
    localStorage.removeItem('token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));

  it('should be loaded with status unauthorised for OAuth2', (done) => {
    authenticationService.load().then((result: AuthorisationResult) => {
      expect(result).toEqual('unauthorized');
      expect(authenticationService.validToken).toEqual(false);
      expect(authenticationService.token).toBeNull();
      done();
    });
  });

  it('should fetch token when loaded with authorisation code', (done) => {
    spyOn(Oauth2Authentication, 'getAuthorisationCode').and.callFake(() =>
      'abc123'
    );
    authenticationService.load().then((result: AuthorisationResult) => {
      expect(result).toEqual('authorized');
      expect(authenticationService.validToken).toEqual(true);
      expect(authenticationService.token).toEqual('XYZ');
      authenticationService.authorised.subscribe((value) => {
        expect(value).toEqual(true);
        done();
      });
    });
    const tokenRequest = httpMock.expectOne(`${config.getConfig('api-url')}/oauth/token`);
    expect(tokenRequest.request.method).toBe('POST');
    tokenRequest.flush({
      access_token: 'XYZ',
      expires_in: 10
    });
  });

});

describe('Oauth2Authentication with OpenID Connect service type', () => {
  let config: AppConfig;
  let authenticationService: AuthenticationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        GbMainModule,
        HttpClientTestingModule,
        routing
      ],
      providers: [
        AuthenticationService,
        Oauth2Authentication,
        {
          provide: AppConfig,
          useClass: OidcConfigMock
        },
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        }
      ]
    });
    config = TestBed.get(AppConfig);
    authenticationService = TestBed.get(AuthenticationService);
    httpMock = TestBed.get(HttpTestingController);
    spyOn(history, 'replaceState').and.callFake((data, title, url) => {});
    localStorage.removeItem('token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));

  it('should be loaded with status unauthorised for OAuth2', (done) => {
    authenticationService.load().then((result: AuthorisationResult) => {
      expect(result).toEqual('unauthorized');
      expect(authenticationService.validToken).toEqual(false);
      expect(authenticationService.token).toBeNull();
      done();
    });
  });

  it('should fetch token when loaded with authorisation code', (done) => {
    spyOn(Oauth2Authentication, 'getAuthorisationCode').and.callFake(() =>
      'abc123'
    );
    authenticationService.load().then((result: AuthorisationResult) => {
      expect(result).toEqual('authorized');
      expect(authenticationService.validToken).toEqual(true);
      expect(authenticationService.token).toEqual('XYZ');
      authenticationService.authorised.subscribe((value) => {
        expect(value).toEqual(true);
        done();
      });
    });
    const tokenRequest = httpMock.expectOne(`${config.getConfig('oidc-server-url')}/token`);
    expect(tokenRequest.request.method).toBe('POST');
    tokenRequest.flush({
      access_token: 'XYZ',
      expires_in: 10
    });
  });

});
