/**
 * Copyright 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BehaviorSubject, Observable, of, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

export class NumericalOperation<T, U> {
  _result: U
  _errorMessage: string
  _callback: (survivalAnalysisClear: T) => { res: U, errMessage: string }
  _data: T
  _subject: BehaviorSubject<{ res: U, errMessage: string }>
  _observable: Observable<{ res: U, errMessage: string }>



  static NewNumericalOperation<T, U>(survivalAnalysisClear: T,
    callback: (survivalAnalysisClear: T) => { res: U, errMessage: string })
    : NumericalOperation<T, U> {
    let numOperation = new NumericalOperation<T, U>()
    numOperation._callback = callback
    numOperation._data = survivalAnalysisClear
    numOperation._subject = new BehaviorSubject({ res: numOperation._result, errMessage: numOperation._errorMessage })
    numOperation._observable = of(numOperation._callback(numOperation._data))
    numOperation._observable.subscribe(
      result => {
        if (result.res) {
          numOperation._result = result.res
        }
        if (result.errMessage) {
          numOperation._errorMessage = result.errMessage
        }
        numOperation._subject.next(result)
      }
    )
    return numOperation
  }

  private constructor() {
    this._result = null
    this._errorMessage = null
  }

  addChild<V>(callback: (survivalAnalysisClear: U) => { res: V, errMessage: string }): NumericalOperation<U, V> {
    let numOperation = new NumericalOperation<U, V>()
    numOperation._callback = callback
    numOperation._subject = new BehaviorSubject({ res: numOperation._result, errMessage: numOperation._errorMessage })
    numOperation._observable = this._subject.pipe(map(
      val => {
        let returnResult = numOperation._callback(val.res)
        let errMessage = ((val.errMessage) || val.errMessage !== '') ? val.errMessage : returnResult.errMessage
        return { res: returnResult.res, errMessage: errMessage }
      }
    ))
    numOperation._observable.subscribe(
      result => {
        if (result.res) {
          numOperation._result = result.res
        }
        if ((result.errMessage) && result.errMessage !== '') {
          numOperation._errorMessage = result.errMessage
        }
        numOperation._subject.next(result)
      }
    )
    return numOperation

  }

  get result(): U {
    return this._result
  }

  get errorMessage(): string {
    return this._errorMessage
  }

  get finished(): boolean {
    return ((this.result) || (this.errorMessage)) ? true : false
  }
}

export type NumericalMethodResult = NumericalOperation<any, string>