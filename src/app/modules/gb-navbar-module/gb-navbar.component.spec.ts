/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GbNavbarComponent} from './gb-navbar.component';
import {MessagesModule, TabMenuModule} from 'primeng';
import {RouterModule} from '@angular/router';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {NavbarService} from '../../services/navbar.service';
import {NavbarServiceMock} from '../../services/mocks/navbar.service.mock';
import {GbMainModule} from '../gb-main-module/gb-main.module';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';

describe('GbNavbarComponent', () => {
  let component: GbNavbarComponent;
  let fixture: ComponentFixture<GbNavbarComponent>;
  let navbarService: NavbarService;

  beforeEach(waitForAsync(() => {
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
          provide: AppConfig,
          useClass: AppConfigMock
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
    navbarService = TestBed.inject(NavbarService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should log out', () => {
    let spy = spyOn(navbarService, 'logout').and.stub();
    component.logout();
    expect(spy).toHaveBeenCalled();
  })

});
