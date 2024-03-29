/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GbAnalysisComponent} from './gb-analysis.component';
import {MockComponent} from 'ng2-mock-component';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {routing} from './gb-analysis.routing';
import {DragDropModule, OverlayPanelModule, SelectButtonModule} from 'primeng';
import {TableModule} from 'primeng/table';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';

describe('GbAnalysisComponent', () => {
  let component: GbAnalysisComponent;
  let fixture: ComponentFixture<GbAnalysisComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbAnalysisComponent,
        MockComponent({selector: 'gb-fractalis-control'}),
        MockComponent({selector: 'gb-fractalis-visual'})
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        CommonModule,
        routing,
        DragDropModule,
        TableModule,
        OverlayPanelModule,
        SelectButtonModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
