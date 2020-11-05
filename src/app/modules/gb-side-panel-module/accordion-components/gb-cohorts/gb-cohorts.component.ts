/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, ElementRef, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { Cohort } from 'app/models/cohort-models/cohort';
import { CohortService, CohortServiceMock } from 'app/services/cohort.service';
import { ConstraintService } from 'app/services/constraint.service';
import { ConfirmationService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel'


@Component({
  selector: 'gb-cohorts',
  templateUrl: './gb-cohorts.component.html',
  styleUrls: ['./gb-cohorts.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class GbCohortsComponent implements AfterViewInit, OnInit {

  public readonly fileElementId: string = 'cohortFileUpload';
  searchName = '';
  _changes: MutationObserver;

  deletionCandidate: Cohort;

  file: File; // holds the uploaded cohort file

  @ViewChild('op', { static: false }) deletionRequest: OverlayPanel;

  constructor(public cohortService: CohortServiceMock,
    private constraintService: ConstraintService,
    private confirmationService: ConfirmationService,
    private element: ElementRef) { }

  get cohorts(): Array<Cohort> {

    return this.cohortService.cohorts
  }
  get selectedCohort(): Cohort {
    return this.cohortService.selectedCohort
  }
  set selectedCohort(cohort: Cohort) {
    this.cohortService.selectedCohort = cohort
  }
  ngOnInit() {
    this.refreshCohorts()
  }

  ngAfterViewInit() {
    /*

    this._changes= new MutationObserver(mutation=>console.log("mutation",mutation))
    this._changes.observe(this.element.nativeElement,{
      attributes: true,
      childList: true,
      subtree: false,
      characterData: true
    })
    */


  }

  dragdebug(event: DragEvent, cohort: Cohort) {
    event.dataTransfer.setData("text", "cohort")


    this.cohortService.selectedCohort = cohort



  }

  refreshCohorts() {
    this.cohortService.getCohorts()
  }





  toggleBookmark(e: Event, cohort: Cohort) {
    e.stopPropagation()
  }

  downloadCohort(e: Event, cohort: Cohort) {
    e.stopPropagation()
  }

  restoreCohort(e: Event, cohort: Cohort) {
    e.stopPropagation()
    this.cohortService.selectedCohort = cohort
    this.cohortService.restoreTerms()
  }

  bookmarkCohort(e: Event, cohort: Cohort) {
    e.stopPropagation()
    cohort.bookmarked = !cohort.bookmarked
  }

  sortByName() {
    var sorted = this.cohortService.cohorts.sort((a, b) => (a.name > b.name) ? 1 : -1)
    this.cohortService.cohorts = sorted
  }

  sortByBookmark() {
    var sorted = this.cohortService.cohorts.sort((a, b) => (!b.bookmarked || a.bookmarked) ? -1 : 1)
    this.cohortService.cohorts = sorted
  }
  sortByDate() {
    var sorted = this.cohortService.cohorts.sort((a, b) => (!b.creationDate ||
      a.creationDate && a.creationDate.getTime() > b.creationDate.getTime()
    ) ? -1 : 1)

    this.cohortService.cohorts = sorted
  }


  onFiltering(event: Event) {
    var filterWord = this.searchName.trim().toLowerCase()
    this.cohortService.cohorts.forEach(cohort => {
      cohort.visible = (cohort.name.toLowerCase().indexOf(filterWord) === -1) ? false : true
    })

  }

  visibles(): Array<Cohort> {
    return this.cohorts.filter(cohort => cohort.visible)
  }

  changeSelect(event: Event, cohort: Cohort) {
    event.stopPropagation()
    this.cohortService.selectedCohort = cohort
  }

  remove(event: Event, cohort: Cohort) {
    event.stopPropagation()

    this.deletionCandidate = cohort


    this.confirmationService.confirm({
      message: `Do you want to permanently remove ${this.deletionCandidate.name} ?`,
      header: 'Confirmation',
      icon: null,
      accept: () => {
        this.cohortService.removeCohorts(cohort)
        if (this.cohortService.selectedCohort && this.cohortService.selectedCohort == cohort) {
          this.cohortService.selectedCohort == null
        }
        this.cohortService.cohorts = this.cohortService.cohorts.filter(c => cohort != c)

      },
      reject: () => {

      }
    });

    this.deletionCandidate = undefined


  }


}
