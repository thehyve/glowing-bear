/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {GbMainComponent} from './gb-main.component';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AngularSplitModule} from 'angular-split';
import {APP_BASE_HREF} from '@angular/common';
import {MockComponent} from 'ng2-mock-component';

describe('GbMainComponent', () => {
  let component: GbMainComponent;
  let fixture: ComponentFixture<GbMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbMainComponent,
        MockComponent({selector: 'gb-side-panel'}),
        MockComponent({selector: 'gb-nav-bar'})
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AngularSplitModule,
        routing
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbMainComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  })

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

});
