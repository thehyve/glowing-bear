/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {MessageService} from 'primeng';

export class MessageHelper {
  public static messageService: MessageService;

  public static alert(severity: 'info' | 'success' | 'warn' | 'error', summary: string, detail?: string) {
    let _detail = detail ? detail : '';
    if (MessageHelper.messageService) {
      MessageHelper.messageService.add({severity: severity, summary: summary, detail: _detail, life: 3000});
    }
    switch (severity) {
      case 'warn':
        console.warn(summary); break;
      case 'error':
        console.error(summary); break;
      default:
        console.log(summary);
    }
  }

  static setMessageService(messageService: MessageService) {
    MessageHelper.messageService = messageService;
  }
}
