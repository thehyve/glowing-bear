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
    switch (dimensionName.toLowerCase()) {
      case 'patient':
        return 'fa fa-male';
      case 'diagnosis id':
        return 'fa fa-stethoscope';
      case 'biosource id':
        return 'fa fa-pagelines';
      case 'biomaterial id':
        return 'fa fa-leaf';
      case 'images id':
        return 'fa fa-image';
      default:
        return 'fa fa-sticky-note';
    }
  }

}
