/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ExportFileFormat} from './export-file-format';

export class ExportDataType {
  private _name: string;
  private _checked: boolean;
  private _fileFormats: ExportFileFormat[];

  constructor(name: string, checked: boolean) {
    this.name = name;
    this.checked = checked;
    this.fileFormats = [];
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    this._checked = value;
  }

  get fileFormats(): ExportFileFormat[] {
    return this._fileFormats;
  }

  set fileFormats(value: ExportFileFormat[]) {
    this._fileFormats = value;
  }

}
