/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class FormatHelper {

  public static readonly nullValuePlaceholder: string = 'MISSING';

  public static formatCountNumber(x: number): string {
    if (typeof(x) === 'number') {
      if (x > -1) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        return '...';
      }
    } else {
      return '...';
    }
  }
}
