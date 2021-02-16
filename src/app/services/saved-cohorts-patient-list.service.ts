/**
 * Copyright 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { ApiCohortsPatientLists } from 'app/models/api-request-models/medco-node/api-cohorts-patient-lists';
import { OperationStatus } from 'app/models/operation-status';
import { ExploreQueryType } from 'app/models/query-models/explore-query-type';
import { ErrorHelper } from 'app/utilities/error-helper';
import { MessageHelper } from 'app/utilities/message-helper';
import { Observable, Subject, throwError } from 'rxjs';
import { of } from 'rxjs';
import { catchError, delay, flatMap, tap } from 'rxjs/operators';
import { ExploreCohortsService } from './api/medco-node/explore-cohorts.service';
import { AuthenticationService } from './authentication.service';
import { CryptoService } from './crypto.service';

@Injectable()
export class SavedCohortsPatientListService {


  /*
   * The user must be authorized to retrieve patient lists
   */

  /*
   * listStorage stores the patient list, indexed by the cohort's name they relate to.
   * There is one list per node.
   */
  _listStorage = new Map<string, number[][]>()



  /*
   * statusStorage stores the status of list when API calls were necessary
   */
  _statusStorage = new Map<string, OperationStatus>()

  /*
   * statusSubjectStorage is used to notify changes in patient list status
   */

  _statusSubjectStorage = new Map<string, Subject<OperationStatus>>()

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
  getListStatusNotifier(cohortName: string): Observable<OperationStatus> {
    if (this._statusSubjectStorage.has(cohortName)) {
      return this._statusSubjectStorage.get(cohortName).asObservable()
    }
    let sub = new Subject<OperationStatus>()
    this._statusSubjectStorage.set(cohortName, sub)
    return sub.asObservable()
  }

  /**
   * getList returns an Observalbe of an array of arrays of numbers
   * if no request is not already ongoing for the given cohort name. I returns observable of null otherwise.
   * There is one array per MedCo node, and each array represents clear patient numbers from this node.
   *
   * @param cohortName
   */
  getList(cohortName: string): Observable<number[][]> {
    if (!this.authorizedForPatientList) {
      throw ErrorHelper.handleNewError(`User ${this.authenticationService.username} is not authorized to retrieve patient lists from previous cohorts`)
    }

    let notifier = this._statusSubjectStorage.has(cohortName) ? this._statusSubjectStorage.get(cohortName) : null
    if (this._listStorage.has(cohortName)) {
      if (notifier) {
        notifier.next(OperationStatus.done)
      }
      return of(this._listStorage.get(cohortName))
    }
    if (this._statusStorage.has(cohortName)) {
      switch (this._statusStorage.get(cohortName)) {
        case OperationStatus.waitOnAPI:
          MessageHelper.alert('warn', `A request was already made to MedCo server nodes for cohort ${cohortName}`)
          return of(null)

        case OperationStatus.decryption:
          MessageHelper.alert('warn', `Cipher text for ${cohortName} still in decryption process`)
          return of(null)

        default:
          break;
      }
    }

    this._statusStorage.set(cohortName, OperationStatus.waitOnAPI)
    if (notifier) {
      notifier.next(OperationStatus.waitOnAPI)
    }

    // creat the POST body object

    let patientListRequest = new ApiCohortsPatientLists()
    patientListRequest.cohortName = cohortName
    patientListRequest.userPublicKey = this.cryptoService.ephemeralPublicKey
    patientListRequest.id = SavedCohortsPatientListService.generateId()



    return this.exploreCohortsService.postCohortsPatientListAllNodes(patientListRequest).pipe(
      tap(
        () => {
          this._statusStorage.set(cohortName, OperationStatus.decryption)
          if (notifier) {
            notifier.next(OperationStatus.decryption)
          }
        },
        err => {
          this._statusStorage.set(cohortName, OperationStatus.error)
          if (notifier) {
            notifier.next(OperationStatus.error)
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
        (patientLists) => {
          this._listStorage.set(cohortName, patientLists)
          this._statusStorage.set(cohortName, OperationStatus.done)
          if (notifier) {
            notifier.next(OperationStatus.done)
          }
        }
      )
    )
  }

  /**
   * insertPatientList insert new patient lists to its list storage.
   * It may be used when clear patient numbers come from another service/component
   *
   * @param cohortName
   * @param patientList
   */
  insertPatientList(cohortName: string, patientLists: number[][]) {
    if (this._listStorage.has(cohortName)) {
      throw ErrorHelper.handleNewError(`Cannot insert new patient lists to already existing saved cohort ${cohortName}`)
    }
    this._listStorage.set(cohortName, patientLists)
  }

  get authorizedForPatientList(): boolean {

    for (const role of this.authenticationService.userRoles) {
      if (role === ExploreQueryType.PATIENT_LIST.id) {
        return true
      }
    }
    return false
  }

  get statusStorage(): Map<string, OperationStatus> {
    return this._statusStorage
  }
}
