/**
 * Copyright 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BehaviorSubject, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * Class NumericalOperation encapsulates rxjs objects
 * to make their emitted results gettable in templates
 */
export class NumericalOperation<T, U> {
  _result: U
  _errorMessage: string
  _callback: (inputData: T) => { res: U, errMessage: string }
  _data: T
  _subject: BehaviorSubject<{ res: U, errMessage: string }>
  _observable: Observable<{ res: U, errMessage: string }>


  /**
   * NewNumericalOperation constructs a new NumericalOperation from input data.
   * The callback is a function using input data as argument. The numerical operation
   * is considered finished when the call back has return a result or an error.
   *
   * In this particular context, errors are treated alongside the output data and not as JS error.
   * The reason is to allow the template of a specific compoment to keep the errors and handle it
   * in any manner. The input data is assumed to be valid under
   * all aspects, but hypotheses of numerical methods.
   *
   * @param inputData
   * @param callback
   */
  static NewNumericalOperation<T, U>(inputData: T,
    callback: (inputData: T) => { res: U, errMessage: string })
    : NumericalOperation<T, U> {
    let numOperation = new NumericalOperation<T, U>()
    numOperation._callback = callback
    numOperation._data = inputData
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

  /**
   * addChild constructs a new NumericalOperation from a previous one, it can be seen as a map operator
   * @param callback
   */
  addChild<V>(callback: (inputData: U) => { res: V, errMessage: string }): NumericalOperation<U, V> {
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
