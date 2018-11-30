/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Aggregate} from './aggregate';
import {AggregateType} from './aggregate-type';

export class EncryptIdsAggregate extends Aggregate {
  private _ownId: string;
  private _childrenIds: string[];

  constructor() {
    super();
    this.type = AggregateType.ENCRYPT_IDS;
    this.childrenIds = [];
  }

  get ownId(): string {
    return this._ownId;
  }

  set ownId(value: string) {
    this._ownId = value;
  }

  get childrenIds(): string[] {
    return this._childrenIds;
  }

  set childrenIds(value: string[]) {
    this._childrenIds = value;
  }
}
