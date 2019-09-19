/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class IconHelper {

  /**
   * Gets an icon for specified dimension name
   * TODO TMT-773 - make dimension icons configurable
   * @param dimensionName
   */
  public static getDimensionIcon(dimensionName: string): string {
    if (!dimensionName) {
      return '';
    }
    const dimension = dimensionName.toLowerCase();
    if (/patient/.test(dimension)) {
      return 'fa fa-male';
    }
    if (/diagnosis/.test(dimension)) {
      return 'fa fa-stethoscope';
    }
    if (/biosource/.test(dimension)) {
      return 'fa fa-pagelines';
    }
    if (/biomaterial/.test(dimension)) {
      return 'fa fa-leaf';
    }
    if (/image/.test(dimension)) {
      return 'fa fa-image';
    }
    return 'fa fa-sticky-note';
  }

}
