/**
 * Copyright 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { ApiCohortsPatientLists } from 'app/models/api-request-models/medco-node/api-cohorts-patient-lists';
import { ErrorHelper } from 'app/utilities/error-helper';
import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';
import { catchError, flatMap, tap } from 'rxjs/operators';
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
  _statusStorage = new Map<string, status>()

  /**
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

  getList(cohortName: string): Observable<number[][]> {
    if (this._notAuthorized) {
      throw ErrorHelper.handleNewError(`User ${this.authenticationService.username} is not authorized to retrieve patient lists from previous cohorts`)
    }
    if (this._listStorage.has(cohortName)) {
      return of(this._listStorage.get(cohortName))
    }

    this._statusStorage.set(cohortName, status.waitOnAPI)

    // creat the POST body object

    let patientListRequest = new ApiCohortsPatientLists()
    patientListRequest.cohortName = cohortName
    patientListRequest.userPublicKey = this.cryptoService.ephemeralPublicKey
    patientListRequest.id = SavedCohortsPatientListService.generateId()



    return this.exploreCohortsService.postCohortsPatientListAllNodes(patientListRequest).pipe(
      tap(
        () => { this._statusStorage.set(cohortName, status.decryption) },
        err => {
          this._statusStorage.set(cohortName, status.error)
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
      )
      ,
      flatMap(
        value => {
          let cipher = value.map(({ results }) => results)
          return this.decrypt(cipher)
        }
      )
    )
  }


}

/**
 * status enumerates the stage of list processing when API calls were necessary
 */

enum status {
  waitOnAPI,
  decryption,
  done,
  error,

}
