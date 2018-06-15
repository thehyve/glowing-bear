import {inject, TestBed} from '@angular/core/testing';

import {AuthenticationService} from './authentication.service';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock, OidcConfigMock} from '../../config/app.config.mock';
import {Oauth2Authentication} from './oauth2-authentication';
import {routing} from '../../app.routing';
import {GbMainModule} from '../../modules/gb-main-module/gb-main.module';
import {APP_BASE_HREF} from '@angular/common';
import {MessageService} from '../message.service';
import {MessageServiceMock} from '../mocks/message.service.mock';
import {AuthorisationResult} from './authorisation-result';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {OidcAuthentication} from './oidc-authentication';
import {OidcConfigService, OidcSecurityService} from 'angular-auth-oidc-client';
import {OidcConfigServiceMock} from './oidc-config-service.mock';
import {OidcSecurityServiceMock} from './oidc-security-service.mock';

describe('Oauth2Authentication', () => {
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
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        }
      ]
    });
    config = TestBed.get(AppConfig);
    authenticationService = TestBed.get(AuthenticationService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));

  it('should be loaded with status unauthorised', (done) => {
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
    const req = httpMock.expectOne(`${config.getConfig('api-url')}/oauth/token`);
    expect(req.request.method).toBe('POST')
    req.flush({
      access_token: 'XYZ',
      expires_in: 10
    });
  });

});

describe('OidcAuthentication', () => {
  let config: AppConfig;
  let authenticationService: AuthenticationService;
  let oidcSecurityService: OidcSecurityService;
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
        OidcAuthentication,
        {
          provide: AppConfig,
          useClass: OidcConfigMock
        },
        {
          provide: OidcConfigService,
          useClass: OidcConfigServiceMock
        },
        {
          provide: OidcSecurityService,
          useClass: OidcSecurityServiceMock
        },
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        }
      ]
    });
    config = TestBed.get(AppConfig);
    authenticationService = TestBed.get(AuthenticationService);
    oidcSecurityService = TestBed.get(OidcSecurityService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));

  it('should be loaded with status unauthorised', (done) => {
    let authorize = spyOn(oidcSecurityService, 'authorize').and.callThrough();
    authenticationService.load().then((result: AuthorisationResult) => {
      expect(result).toEqual('unauthorized');
      expect(authenticationService.validToken).toEqual(false);
      expect(authenticationService.token).toBeNull();

      // expect(authorize).toHaveBeenCalled();
      done();
    });
  });

  it('should have token when loaded with token in url', (done) => {
    spyOn(OidcAuthentication, 'isTokenRedirect').and.callFake(() => true);
    authenticationService.load().then((result: AuthorisationResult) => {
      expect(result).toEqual('authorized');
      expect(authenticationService.validToken).toEqual(true);
      expect(authenticationService.token).toEqual('XYZ');
      authenticationService.authorised.subscribe((value) => {
        expect(value).toEqual(true);
        done();
      });
    });
  });

});
