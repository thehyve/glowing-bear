/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {ToastrService} from 'ngx-toastr';

export class MessageHelper {

  // this service is injected at boot by the AppComponent
  public static toastrService: ToastrService;

  public static alert(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail?: string) {
    let consoleMsg = `[MESSAGE] ${summary}`;
    if (detail) {
      consoleMsg += `\n${detail}`;
    }

    switch (severity) {
      case 'error':
        this.toastrService.error(summary, detail);
        console.error(consoleMsg);
        break;

      case 'warn':
        this.toastrService.warning(summary, detail);
        console.warn(consoleMsg);
        break;

      case 'success':
        this.toastrService.success(summary, detail);
        console.log(consoleMsg);
        break;

      case 'info':
      default:
        this.toastrService.info(summary, detail);
        console.log(consoleMsg);
        break;
    }
  }
}
