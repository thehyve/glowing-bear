/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, Input, EventEmitter, ViewEncapsulation, Output } from '@angular/core';
import { CohortService, CohortServiceMock } from 'app/services/cohort.service';
import { Cohort, SurvivalCohort } from 'app/models/cohort-models/cohort';
import { ApiSurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';


@Component({
  selector: 'app-gb-cohort-landing-zone',
  templateUrl: './gb-cohort-landing-zone.component.html',
  styleUrls: ['./gb-cohort-landing-zone.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GbCohortLandingZoneComponent implements OnInit {
  _activated = false
  _dedicated = false
  _subgroup = false
  _cohort: SurvivalCohort
  _ran = false
  _selectedSubgroup: Cohort

  @Output()
  dedication: EventEmitter<boolean> = new EventEmitter()

  constructor(private cohortService: CohortServiceMock) {
    let cohort = this.cohortService.selectedCohort
    if (cohort) {
      let ric = cohort.rootInclusionConstraint
      let rec = cohort.rootExclusionConstraint
      this._cohort = new SurvivalCohort(cohort.name, ric ? ric.clone() : null, rec ? rec.clone() : null, cohort.creationDate, cohort.updateDate)
      this.dedicated = true
    }

    cohortService.selectingCohort.subscribe((cohort => {
      this._cohort = cohort;
      this._dedicated = (this._cohort !== null)
      this.dedication.emit(this.dedicated)
    }).bind(this))
  }

  ngOnInit() {
    this.dedication.emit(this.dedicated)
  }


  @Input()
  set activated(bool: boolean) {
    this._activated = bool
  }
  get activated(): boolean {
    return this._activated
  }

  set dedicated(bool: boolean) {
    this._dedicated = bool
  }
  get dedicated(): boolean {
    return this._dedicated
  }


  get cohort(): Cohort {
    return this._cohort
  }

  set subgroup(val: boolean) {
    this._subgroup = val
  }

  get subgroup(): boolean {
    return this._subgroup
  }


  drop(event: DragEvent) {
    event.preventDefault()




  }
  draggingmode(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()



  }


  get ran(): boolean {
    return this._ran
  }

  run() {

    this._ran = true

  }
  get subGroups() {
    if (this.cohort instanceof SurvivalCohort) {
      return (this.cohort as SurvivalCohort).subGroups.map(group => { return { label: group.name, value: group } })
    } else { return [] }
  }


  get isSurv() {
    return this.cohort instanceof SurvivalCohort
  }
  set selectedSubGroup(cohort: Cohort) {
    this.subgroup = cohort !== null
    this._selectedSubgroup = cohort

  }

  get selectedSubGroup(): Cohort {
    return this._selectedSubgroup
  }

  changeSelectedSubGroup(event: Event, subGroup: Cohort) {
    event.stopPropagation()
    if (this.selectedSubGroup) {
      this.selectedSubGroup.selected = false
    }

    this.selectedSubGroup = subGroup
    this.selectedSubGroup.selected = true
  }


}
