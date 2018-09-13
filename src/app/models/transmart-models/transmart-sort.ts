/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Order} from '../table-models/order';

export class TransmartSort {
  dimension: string;
  sortOrder: Order;
  userRequested?: boolean;

  constructor(dimension: string, order: Order) {
    this.dimension = dimension;
    this.sortOrder = order;
  }
}
