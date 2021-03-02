/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 CHUV
 * Copyright 2020 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, ElementRef, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel'
import {CohortService} from '../../../../services/cohort.service';
import {SavedCohortsPatientListService} from '../../../../services/saved-cohorts-patient-list.service';
import {ConstraintService} from '../../../../services/constraint.service';
import {Cohort} from '../../../../models/cohort-models/cohort';
import {savePatientListToCSVFile} from '../../../../utilities/files/csv';
import {OperationStatus} from '../../../../models/operation-status';
import {ErrorHelper} from '../../../../utilities/error-helper';


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
  OperationStatus = OperationStatus;

  @ViewChild('op', { static: false }) deletionRequest: OverlayPanel;


  constructor(public cohortService: CohortService,
    private constraintService: ConstraintService,
    private confirmationService: ConfirmationService,
    private element: ElementRef,
    private savedCohortsPatientListService: SavedCohortsPatientListService) { }

  get cohorts(): Array<Cohort> {

    return this.cohortService.cohorts
  }
  get selectedCohort(): Cohort {
    return this.cohortService.selectedCohort
  }
  set selectedCohort(cohort: Cohort) {
    this.cohortService.selectedCohort = cohort
  }

  get authorizedForPatientList(): boolean {
    return this.savedCohortsPatientListService.authorizedForPatientList
  }

  get patientListsStatus(): Map<string, OperationStatus> {
    return this.savedCohortsPatientListService.statusStorage
  }

  ngOnInit() {
    this.refreshCohorts()
  }

  ngAfterViewInit() {
    /*

    this._changes= new MutationObserver(mutation=>console.log('mutation',mutation))
    this._changes.observe(this.element.nativeElement,{
      attributes: true,
      childList: true,
      subtree: false,
      characterData: true
    })
    */


  }

  dragdebug(event: DragEvent, cohort: Cohort) {
    event.dataTransfer.setData('text', 'cohort')


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
    this.savedCohortsPatientListService.getListStatusNotifier(cohort.name).subscribe(
      (x) => { console.log(`New status of request for patient list of saved cohort ${cohort.name}, status: ${x}`) }
    )
    this.savedCohortsPatientListService.getList(cohort.name).subscribe(
      value => { if (value) { savePatientListToCSVFile(cohort.name, value[0].map(node => node.name), value[1]) } },
      err => {
        throw ErrorHelper.handleError(`While retrieving list for cohort ${cohort.name}`, err)
      }
    )
  }

  restoreCohort(e: Event, cohort: Cohort) {
    e.stopPropagation()
    this.cohortService.selectedCohort = cohort
    this.cohortService.restoreTerms(cohort)
  }

  bookmarkCohort(e: Event, cohort: Cohort) {
    e.stopPropagation()
    cohort.bookmarked = !cohort.bookmarked
  }

  sortByName() {
    let sorted = this.cohortService.cohorts.sort((a, b) => (a.name > b.name) ? 1 : -1)
    this.cohortService.cohorts = sorted
  }

  sortByBookmark() {
    let sorted = this.cohortService.cohorts.sort((a, b) => (!b.bookmarked || a.bookmarked) ? -1 : 1)
    this.cohortService.cohorts = sorted
  }
  sortByDate() {
    let sorted = this.cohortService.cohorts.sort((a, b) => (!b.creationDate ||
      a.creationDate && a.lastUpdateDate() > b.lastUpdateDate()
    ) ? -1 : 1)

    this.cohortService.cohorts = sorted
  }


  onFiltering(event: Event) {
    let filterWord = this.searchName.trim().toLowerCase()
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
        this.savedCohortsPatientListService.removePatientList(cohort.name)
        this.cohortService.removeCohorts(cohort)
        if (this.cohortService.selectedCohort && this.cohortService.selectedCohort === cohort) {
          this.cohortService.selectedCohort = null
        }
        this.cohortService.cohorts = this.cohortService.cohorts.filter(c => cohort !== c)

      },
      reject: () => {

      }
    });
    this.deletionCandidate = undefined
  }
}
