/**
 * Copyright 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { ApiCohortsPatientLists } from 'app/models/api-request-models/medco-node/api-cohorts-patient-lists';
import { PatientListOperationStatus } from 'app/models/cohort-models/patient-list-operation-status';
import { ErrorHelper } from 'app/utilities/error-helper';
import { Observable, Subject, throwError } from 'rxjs';
import { of } from 'rxjs';
import { catchError, delay, flatMap, tap } from 'rxjs/operators';
import { ExploreCohortsService } from './api/medco-node/explore-cohorts.service';
import { AuthenticationService } from './authentication.service';
import { CryptoService } from './crypto.service';

@Injectable()
export class SavedCohortsPatientListService {


  // user is assumed to be authorized, it will changed if he gets a forbidden error
  _notAuthorized = false

  /*
   * listStorage stores the patient list, indexed by the cohort's name they relate to.
   * There is one list per node.
   */
  _listStorage = new Map<string, number[][]>()



  /*
   * statusStorage stores the status of list when API calls were necessary
   */
  _statusStorage = new Map<string, PatientListOperationStatus>()

  /*
   * statusSubjectStorage is used to notify changes in patient list status
   */

  _statusSubjectStorage = new Map<string, Subject<PatientListOperationStatus>>()

  /*
  * Generates a newID for a query.
  */
  private static generateId(): string {
    let d = new Date();
    let id = `MedCo_Cohorts_Patient_List_${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}${d.getUTCHours()}` +
      `${d.getUTCMinutes()}${d.getUTCSeconds()}${d.getUTCMilliseconds()}`;

    return id
  }


  constructor(private cryptoService: CryptoService,
    private exploreCohortsService: ExploreCohortsService,
    private authenticationService: AuthenticationService) { }

  private decrypt(cipherPatientLists: string[][]): Observable<number[][]> {
    return of(cipherPatientLists.map(value => value.map(cipher => this.cryptoService.decryptIntegerWithEphemeralKey(cipher))))
  }

  /**
   * getListStatusNotifier creates or returns existing rxjs Subject, indentified by the cohort name,
   * and returns it as an rxjs Observable.
   * getListStatusNotifier must be used before getList to work correctly.
   *
   * @param cohortName
   */
  getListStatusNotifier(cohortName: string): Observable<PatientListOperationStatus> {
    if (this._statusSubjectStorage.has(cohortName)) {
      return this._statusSubjectStorage.get(cohortName).asObservable()
    }
    let sub = new Subject<PatientListOperationStatus>()
    this._statusSubjectStorage.set(cohortName, sub)
    return sub.asObservable()
  }

  /**
   * getList returns an Observalbe of an array of arrays of numbers.
   * There is one array per MedCo node, and each array represents clear patient numbers from this node.
   *
   * @param cohortName
   */
  getList(cohortName: string): Observable<number[][]> {
    if (this._notAuthorized) {
      throw ErrorHelper.handleNewError(`User ${this.authenticationService.username} is not authorized to retrieve patient lists from previous cohorts`)
    }

    let notifier = this._statusSubjectStorage.has(cohortName) ? this._statusSubjectStorage.get(cohortName) : null
    if (this._listStorage.has(cohortName)) {
      if (notifier) {
        notifier.next(PatientListOperationStatus.done)
      }
      return of(this._listStorage.get(cohortName))
    }

    this._statusStorage.set(cohortName, PatientListOperationStatus.waitOnAPI)
    if (notifier) {
      notifier.next(PatientListOperationStatus.waitOnAPI)
    }

    // creat the POST body object

    let patientListRequest = new ApiCohortsPatientLists()
    patientListRequest.cohortName = cohortName
    patientListRequest.userPublicKey = this.cryptoService.ephemeralPublicKey
    patientListRequest.id = SavedCohortsPatientListService.generateId()



    return this.exploreCohortsService.postCohortsPatientListAllNodes(patientListRequest).pipe(
      tap(
        () => {
          this._statusStorage.set(cohortName, PatientListOperationStatus.decryption)
          if (notifier) {
            notifier.next(PatientListOperationStatus.decryption)
          }
        },
        err => {
          this._statusStorage.set(cohortName, PatientListOperationStatus.error)
          if (notifier) {
            notifier.next(PatientListOperationStatus.error)
          }
          if (err.status === 403) {
            this._notAuthorized = true
          }
        }
      ),
      catchError(err => {
        if (err.status !== 403) {
          return throwError(err)
        } else {
          return throwError(ErrorHelper.handleNewError(`User ${this.authenticationService.username} is not authorized to retrieve patient lists from previous cohorts`))
        }
      }
      ),
      // dirty trick: if the decryption starts immediatelly, views depending on notifiers won't be updating on
      // as the browser would be frozen (even for 2 or 3 seconds)
      // a solution could be the use of a web worker
      delay(100),
      flatMap(
        value => {
          let cipher = value.map(({ results }) => results)
          return this.decrypt(cipher)
        }
      ),
      tap(
        () => {
          this._statusStorage.set(cohortName, PatientListOperationStatus.done)
          if (notifier) {
            notifier.next(PatientListOperationStatus.done)
          }
        }
      )
    )
  }

  get notAuthorized(): boolean {
    return this._notAuthorized
  }

  get statusStorage(): Map<string, PatientListOperationStatus> {
    return this._statusStorage
  }
}
