/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {
  trigger, style, animate, transition
} from '@angular/animations';
import { GbConstraintComponent } from '../constraint-components/gb-constraint/gb-constraint.component';
import { QueryService } from '../../../services/query.service';
import { ConstraintService } from '../../../services/constraint.service';
import { FormatHelper } from '../../../utilities/format-helper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type LoadingState = 'loading' | 'complete';

@Component({
  selector: 'gb-selection',
  templateUrl: './gb-selection.component.html',
  styleUrls: ['./gb-selection.component.css'],
  animations: [
    trigger('notifyState', [
      transition('loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 0.5)'
        }),
        animate('1000ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class GbSelectionComponent {

  @ViewChild('rootInclusionConstraintComponent', { static: true }) rootInclusionConstraintComponent: GbConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent', { static: true }) rootExclusionConstraintComponent: GbConstraintComponent;

  private isUploadListenerNotAdded: boolean;

  constructor(public constraintService: ConstraintService,
    private queryService: QueryService) {
    this.isUploadListenerNotAdded = true;
  }

  get globalCount(): Observable<string> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? FormatHelper.formatCountNumber(queryResults.globalCount) : '0'
    ));
  }

  get loadingState(): LoadingState {
    return this.queryService.isUpdating ? 'loading' : 'complete';
  }

  get queryTimingSameInstance(): boolean {
    return (this.queryService.queryTimingSameInstance) ? this.queryService.queryTimingSameInstance : false
  }

  set queryTimingSameInstance(val: boolean) {
    this.queryService.queryTimingSameInstance = val
  }
}
