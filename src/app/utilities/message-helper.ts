/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Message, MessageService} from 'primeng/api';

export class MessageHelper {
  // this field is injected by the AppComponent constructor
  public static messageService: MessageService;

  public static messages: Message[] = [];

  public static alert(severity: string, summary: string, detail?: string) {
    let _detail = detail ? detail : '';
    // This hack is to address the bug where primneNg growl does not time out
    MessageHelper.messages = [].concat(MessageHelper.messages);
    MessageHelper.messages.push({severity: severity, summary: summary, detail: _detail});

    let consoleMsg = `[MESSAGE] ${summary}`;
    if (detail) {
      consoleMsg += `\n${detail}`;
    }

    switch (severity) {
      case 'error':
        console.error(consoleMsg);
        break;

      case 'warn':
        console.warn(consoleMsg);
        break;

      default:
        console.log(consoleMsg);
        break;
    }
  }
}
