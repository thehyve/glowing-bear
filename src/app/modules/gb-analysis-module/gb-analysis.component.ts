/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'gb-analysis',
  templateUrl: './gb-analysis.component.html',
  styleUrls: ['./gb-analysis.component.css']
})
export class GbAnalysisComponent implements OnInit, AfterViewChecked {

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  draggingmode(event) {
    event.preventDefault()
  }

  ngOnInit() {
  }

  // without this, ExpressionChangedAfterItHasBeenCheckedError when going from Analysis to Explore
  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges()
  }

}
