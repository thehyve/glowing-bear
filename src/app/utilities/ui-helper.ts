/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ElementRef} from '@angular/core';

export class UIHelper {

  /**
   * The PrimeNg library often produces unwanted loader spinning icon,
   * which needs to be manually removed
   * @param {ElementRef} element
   * @param {number} delay
   */
  public static removePrimeNgLoaderIcon(element: ElementRef, delay: number) {
    window.setTimeout((function () {
      let loaderIcon = element.nativeElement.querySelector('.ui-autocomplete-loader');
      if (loaderIcon) {
        loaderIcon.remove();
      }
    }).bind(this), delay);
  }

}
