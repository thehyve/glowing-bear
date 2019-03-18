/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {FormatHelper} from '../../utilities/format-helper';

export class ExportJob {
  private _id: string;
  private _name: string;
  private _status: string;
  private _time: Date;
  private _timeDescription: string;
  private _userId: string;
  private _viewerURL: string;
  private _disabled: boolean;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get time(): Date {
    return this._time;
  }

  set time(value: Date) {
    this._time = value;
    this.timeDescription = FormatHelper.formatDateSemantics(value);
  }

  get timeDescription(): string {
    return this._timeDescription;
  }

  set timeDescription(value: string) {
    this._timeDescription = value;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(value: string) {
    this._userId = value;
  }

  get viewerURL(): string {
    return this._viewerURL;
  }

  set viewerURL(value: string) {
    this._viewerURL = value;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }
}
