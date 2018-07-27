/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';

import {AuthenticationService} from './authentication.service';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock, OidcConfigMock} from '../../config/app.config.mock';
import {Oauth2Authentication} from './oauth2-authentication';
import {routing} from '../../app.routing';
import {GbMainModule} from '../../modules/gb-main-module/gb-main.module';
import {APP_BASE_HREF} from '@angular/common';
import {AuthorizationResult} from './authorization-result';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AccessLevel} from './access-level';
import * as jwt_decode from 'jwt-decode';

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
    authenticationService.load().then((result: AuthorizationResult) => {
      expect(result).toEqual(AuthorizationResult.Unauthorized);
      expect(authenticationService.validToken).toEqual(false);
      expect(authenticationService.token).toBeNull();
      done();
    });
  });

  it('should fetch token when loaded with authorisation code', (done) => {
    spyOn(Oauth2Authentication, 'getAuthorisationCode').and.callFake(() =>
      'abc123'
    );
    authenticationService.load().then((result: AuthorizationResult) => {
      expect(result).toEqual(AuthorizationResult.Authorized);
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
    authenticationService.load().then((result: AuthorizationResult) => {
      expect(result).toEqual(AuthorizationResult.Unauthorized);
      expect(authenticationService.validToken).toEqual(false);
      expect(authenticationService.token).toBeNull();
      done();
    });
  });

  it('should fetch token when loaded with authorisation code', (done) => {
    spyOn(Oauth2Authentication, 'getAuthorisationCode').and.callFake(() =>
      'abc123'
    );
    authenticationService.load().then((result: AuthorizationResult) => {
      expect(result).toEqual(AuthorizationResult.Authorized);
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

  const accessToken1 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InQySjQ4ZHFZT0ljUExiRDd' +
    'DT3VSOS1IUXpkWjdOeUdLeEpwd1l4Wms2VEUifQ.eyJqdGkiOiI4MjAzZmRlZS0yMjE' +
    '2LTRhNDctYTMwNS1iMTA0OTQ2NzQxZTQiLCJleHAiOjE1MzI3MTA2NzUsIm5iZiI6MC' +
    'wiaWF0IjoxNTMyNzEwMTk1LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmV4YW1wbGUuY' +
    '29tL2F1dGgvcmVhbG1zL3RyYW5zbWFydC10ZXN0IiwiYXVkIjoidHJhbnNtYXJ0LWNs' +
    'aWVudCIsInN1YiI6InRlc3QtdXNlciIsInR5cCI6IkJlYXJlciIsImF6cCI6InRyYW5' +
    'zbWFydC1jbGllbnQiLCJhdXRoX3RpbWUiOjE1MzI3MTAxOTQsInNlc3Npb25fc3RhdG' +
    'UiOiIzN2M2MDk3My1lMmVlLTQ5NmItOTIwMi04YTBkMjY1YjMzNmUiLCJhY3IiOiIxI' +
    'iwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3QiLCJodHRwOi8vbG9j' +
    'YWxob3N0OjQyMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInVtYV9hdXRob3J' +
    'pemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6ey' +
    'Jyb2xlcyI6WyJ2aWV3LXVzZXJzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktdXNlcnMiX' +
    'X0sInRyYW5zbWFydC1jbGllbnQiOnsicm9sZXMiOlsiRVhQOlNDU0NQfFNVTU1BUlki' +
    'XX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWN' +
    'jb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sIm5hbWUiOiJUZXN0IFVzZXIiLC' +
    'JwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0ZXN0IiwiZ2l2ZW5fbmFtZSI6IlRlc3QiLCJmY' +
    'W1pbHlfbmFtZSI6IlVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.bGta6' +
    'C-gps3nNcOuV43VdSPgBJ-nbkTOLqAjUZOgNA9IXFP_454JTpqBQY6yCGtzu_kLPQ-D' +
    'jyB3XKx0jrZqOWTdsHEPiIllIusIcnZdn27tUF0gZXbfk1w3oWevaZ6b0mOx8HzEJK1' +
    'kxnHMrzCaJYnYM4fezoq9vzZbaqPuiLrikrrlK-i3NltwqL-xCAmjpapWrf_PvcA_Gv' +
    'kYsma2a0hx8IVJNU5qR2m7zvspX9g90yFi1Nh03eGw8S54-d2YK7U7Ktk5eFu39sPnQ' +
    'XiJv0E4S03So_B9zkt8ZrM-4dsT4ZZOsTjxirxqfO4T_RIWp7kmz9jjwfcH2Zhv_TWVzg';

  const tokenContents1 = JSON.parse(`{
    "jti": "8203fdee-2216-4a47-a305-b104946741e4",
    "exp": 1532710675,
    "nbf": 0,
    "iat": 1532710195,
    "iss": "https://keycloak.example.com/auth/realms/transmart-test",
    "aud": "transmart-client",
    "sub": "test-user",
    "typ": "Bearer",
    "azp": "transmart-client",
    "auth_time": 1532710194,
    "session_state": "37c60973-e2ee-496b-9202-8a0d265b336e",
    "acr": "1",
    "allowed-origins": [
      "http://localhost",
      "http://localhost:4200"
    ],
    "realm_access": {
      "roles": [
        "uma_authorization"
      ]
    },
    "resource_access": {
      "realm-management": {
        "roles": [
          "view-users",
          "query-groups",
          "query-users"
        ]
      },
      "transmart-client": {
        "roles": [
          "EXP:SCSCP|SUMMARY"
        ]
      },
      "account": {
        "roles": [
          "manage-account",
          "manage-account-links",
          "view-profile"
        ]
      }
    },
    "name": "Test User",
    "preferred_username": "test",
    "given_name": "Test",
    "family_name": "User",
    "email": "test@example.com"
  }`);

  it('should detect restricted access level from the token contents', (done) => {
    spyOn(Oauth2Authentication, 'getAuthorisationCode').and.callFake(() =>
      'abc123'
    );
    authenticationService.load().then((result: AuthorizationResult) => {
      expect(result).toEqual(AuthorizationResult.Authorized);
      expect(jwt_decode(authenticationService.token)).toEqual(tokenContents1);
      expect(authenticationService.accessLevel).toEqual(AccessLevel.Restricted);
      done();
    });
    const tokenRequest = httpMock.expectOne(`${config.getConfig('oidc-server-url')}/token`);
    expect(tokenRequest.request.method).toBe('POST');
    tokenRequest.flush({
      access_token: accessToken1,
      expires_in: 10
    });
  });

  const accessToken2 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InQySjQ4ZHFZT0ljUExiRDd' +
    'DT3VSOS1IUXpkWjdOeUdLeEpwd1l4Wms2VEUifQ.eyJqdGkiOiI4MjAzZmRlZS0yMjE' +
    '2LTRhNDctYTMwNS1iMTA0OTQ2NzQxZTQiLCJleHAiOjE1MzI3MTA2NzUsIm5iZiI6MC' +
    'wiaWF0IjoxNTMyNzEwMTk1LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmV4YW1wbGUuY' +
    '29tL2F1dGgvcmVhbG1zL3RyYW5zbWFydC10ZXN0IiwiYXVkIjoidHJhbnNtYXJ0LWNs' +
    'aWVudCIsInN1YiI6InRlc3QtdXNlciIsInR5cCI6IkJlYXJlciIsImF6cCI6InRyYW5' +
    'zbWFydC1jbGllbnQiLCJhdXRoX3RpbWUiOjE1MzI3MTAxOTQsInNlc3Npb25fc3RhdG' +
    'UiOiIzN2M2MDk3My1lMmVlLTQ5NmItOTIwMi04YTBkMjY1YjMzNmUiLCJhY3IiOiIxI' +
    'iwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3QiLCJodHRwOi8vbG9j' +
    'YWxob3N0OjQyMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInVtYV9hdXRob3J' +
    'pemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6ey' +
    'Jyb2xlcyI6WyJ2aWV3LXVzZXJzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktdXNlcnMiX' +
    'X0sInRyYW5zbWFydC1jbGllbnQiOnsicm9sZXMiOlsiUk9MRV9BRE1JTiJdfSwiYWNj' +
    'b3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWx' +
    'pbmtzIiwidmlldy1wcm9maWxlIl19fSwibmFtZSI6IlRlc3QgVXNlciIsInByZWZlcn' +
    'JlZF91c2VybmFtZSI6InRlc3QiLCJnaXZlbl9uYW1lIjoiVGVzdCIsImZhbWlseV9uY' +
    'W1lIjoiVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.ujxMs_1uEaSP3Sq' +
    'mT9pu6jTRJW4Mdg-z-1EQNiC9gJ-lrhqmzZdTs-LsDNrE80GnhKVLEp4hjV7AIa6IGq' +
    'nP7rs7z_fyRTnw9w-ZKW04tIksgEiOdcQkIMKMyMSUNVEc-jzYFekXzq74zTpL6nvrw' +
    'cf2o7_kMnnEMXX1wbQDiKwmLGX5MJlUyJUSua1SzcyyurRUPFfmzzk2UtxIfwlb3Oom' +
    'TdpNjRLHizbnhHlX47ZHvzkW0ZPBvNwy_7wUikFYdMzvMQ33b0FPgxaNKaunMtJLYAN' +
    'SEA4wSQATyg8ZSynWIDpsLFScrb2YBmE3EQ0_00GWX9aG6KbKqBlB-HlWNA';

  const tokenContents2 = JSON.parse(`{
    "jti": "8203fdee-2216-4a47-a305-b104946741e4",
    "exp": 1532710675,
    "nbf": 0,
    "iat": 1532710195,
    "iss": "https://keycloak.example.com/auth/realms/transmart-test",
    "aud": "transmart-client",
    "sub": "test-user",
    "typ": "Bearer",
    "azp": "transmart-client",
    "auth_time": 1532710194,
    "session_state": "37c60973-e2ee-496b-9202-8a0d265b336e",
    "acr": "1",
    "allowed-origins": [
      "http://localhost",
      "http://localhost:4200"
    ],
    "realm_access": {
      "roles": [
        "uma_authorization"
      ]
    },
    "resource_access": {
      "realm-management": {
        "roles": [
          "view-users",
          "query-groups",
          "query-users"
        ]
      },
      "transmart-client": {
        "roles": [
          "ROLE_ADMIN"
        ]
      },
      "account": {
        "roles": [
          "manage-account",
          "manage-account-links",
          "view-profile"
        ]
      }
    },
    "name": "Test User",
    "preferred_username": "test",
    "given_name": "Test",
    "family_name": "User",
    "email": "test@example.com"
  }`);

  it('should detect full access for admin users from the token contents', (done) => {
    spyOn(Oauth2Authentication, 'getAuthorisationCode').and.callFake(() =>
      'abc123'
    );
    authenticationService.load().then((result: AuthorizationResult) => {
      expect(result).toEqual(AuthorizationResult.Authorized);
      expect(jwt_decode(authenticationService.token)).toEqual(tokenContents2);
      expect(authenticationService.accessLevel).toEqual(AccessLevel.Full);
      done();
    });
    const tokenRequest = httpMock.expectOne(`${config.getConfig('oidc-server-url')}/token`);
    expect(tokenRequest.request.method).toBe('POST');
    tokenRequest.flush({
      access_token: accessToken2,
      expires_in: 10
    });
  });

  const accessToken3 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InQySjQ4ZHFZT0ljUExiRDd' +
    'DT3VSOS1IUXpkWjdOeUdLeEpwd1l4Wms2VEUifQ.eyJqdGkiOiI4MjAzZmRlZS0yMjE' +
    '2LTRhNDctYTMwNS1iMTA0OTQ2NzQxZTQiLCJleHAiOjE1MzI3MTA2NzUsIm5iZiI6MC' +
    'wiaWF0IjoxNTMyNzEwMTk1LCJpc3MiOiJodHRwczovL2tleWNsb2FrLmV4YW1wbGUuY' +
    '29tL2F1dGgvcmVhbG1zL3RyYW5zbWFydC10ZXN0IiwiYXVkIjoidHJhbnNtYXJ0LWNs' +
    'aWVudCIsInN1YiI6InRlc3QtdXNlciIsInR5cCI6IkJlYXJlciIsImF6cCI6InRyYW5' +
    'zbWFydC1jbGllbnQiLCJhdXRoX3RpbWUiOjE1MzI3MTAxOTQsInNlc3Npb25fc3RhdG' +
    'UiOiIzN2M2MDk3My1lMmVlLTQ5NmItOTIwMi04YTBkMjY1YjMzNmUiLCJhY3IiOiIxI' +
    'iwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3QiLCJodHRwOi8vbG9j' +
    'YWxob3N0OjQyMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInVtYV9hdXRob3J' +
    'pemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6ey' +
    'Jyb2xlcyI6WyJ2aWV3LXVzZXJzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktdXNlcnMiX' +
    'X0sInRyYW5zbWFydC1jbGllbnQiOnsicm9sZXMiOlsiRVhQOlNDU0NQfE1FQVNVUkVN' +
    'RU5UUyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmF' +
    'nZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwibmFtZSI6IlRlc3QgVX' +
    'NlciIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3QiLCJnaXZlbl9uYW1lIjoiVGVzd' +
    'CIsImZhbWlseV9uYW1lIjoiVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9' +
    '.e2ewWY5hkymhjAl__PUbJ5mAg315czKUA9EDpE1Y3muPFh7lKuFLZrtO1tJTL_vfRp' +
    '2YNrUWEGIlqNWtu3UPLTXuSF13MHKzglOvqrpHAfIimzm5Cc_M3n7xbXgf3ulNn10mG' +
    'xiHnNP7pRCRMOTQQccG6inLSw6ojtABb-yYoOHLdpkyaxYbYHjq6UZI0c0CM5GijAlA' +
    's7YbKnzWmqH-dLJLPQJZcK9QnyNKsHww1pblGwFRjQqFsWyNt4hB-oxQ4Oqu03UtevL' +
    'WtbjSDFuftyL6mVk7uLJIJBsPhsdXIksHwcRrpj3YuX1AXPvRqbKUxxwbjopX_D4stc' +
    'hsFqggSA';

  const tokenContents3 = JSON.parse(`{
    "jti": "8203fdee-2216-4a47-a305-b104946741e4",
    "exp": 1532710675,
    "nbf": 0,
    "iat": 1532710195,
    "iss": "https://keycloak.example.com/auth/realms/transmart-test",
    "aud": "transmart-client",
    "sub": "test-user",
    "typ": "Bearer",
    "azp": "transmart-client",
    "auth_time": 1532710194,
    "session_state": "37c60973-e2ee-496b-9202-8a0d265b336e",
    "acr": "1",
    "allowed-origins": [
      "http://localhost",
      "http://localhost:4200"
    ],
    "realm_access": {
      "roles": [
        "uma_authorization"
      ]
    },
    "resource_access": {
      "realm-management": {
        "roles": [
          "view-users",
          "query-groups",
          "query-users"
        ]
      },
      "transmart-client": {
        "roles": [
          "EXP:SCSCP|MEASUREMENTS"
        ]
      },
      "account": {
        "roles": [
          "manage-account",
          "manage-account-links",
          "view-profile"
        ]
      }
    },
    "name": "Test User",
    "preferred_username": "test",
    "given_name": "Test",
    "family_name": "User",
    "email": "test@example.com"
  }`);

  it('should detect full measurements access from the token contents', (done) => {
    spyOn(Oauth2Authentication, 'getAuthorisationCode').and.callFake(() =>
      'abc123'
    );
    authenticationService.load().then((result: AuthorizationResult) => {
      expect(result).toEqual(AuthorizationResult.Authorized);
      expect(jwt_decode(authenticationService.token)).toEqual(tokenContents3);
      expect(authenticationService.accessLevel).toEqual(AccessLevel.Full);
      done();
    });
    const tokenRequest = httpMock.expectOne(`${config.getConfig('oidc-server-url')}/token`);
    expect(tokenRequest.request.method).toBe('POST');
    tokenRequest.flush({
      access_token: accessToken3,
      expires_in: 10
    });
  });

});
