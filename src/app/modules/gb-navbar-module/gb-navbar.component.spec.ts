/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbNavbarComponent} from './gb-navbar.component';
import {MessagesModule, TabMenuModule} from 'primeng/primeng';
import {Router, RouterModule} from '@angular/router';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {NavbarService} from '../../services/navbar.service';
import {NavbarServiceMock} from '../../services/mocks/navbar.service.mock';
import {GbMainModule} from '../gb-main-module/gb-main.module';

describe('GbNavbarComponent', () => {
  let component: GbNavbarComponent;
  let fixture: ComponentFixture<GbNavbarComponent>;
  let router: Router;
  let navbarService: NavbarService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule,
        TabMenuModule,
        FormsModule,
        GbMainModule,
        MessagesModule,
        routing
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        },
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbNavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    navbarService = TestBed.get(NavbarService);
    router.initialNavigation();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should handle router events', () => {
    spyOn(router.events, 'subscribe').and.returnValue(event).and.callThrough();
    component.ngOnInit();
    expect(router.events.subscribe).toHaveBeenCalled();
  });

  it('should log out', () => {
    let spy = spyOn(navbarService, 'logout').and.stub();
    component.logout();
    expect(spy).toHaveBeenCalled();
  })

});
