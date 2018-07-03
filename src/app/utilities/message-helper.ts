/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Message} from 'primeng/api';

export class MessageHelper {
  public static messages: Message[] = [];

  public static alert(severity: string, summary: string, detail?: string) {
    let _detail = detail ? detail : '';
    // This hack is to address the bug where primneNg growl does not time out
    MessageHelper.messages = [].concat(MessageHelper.messages);
    MessageHelper.messages.push({severity: severity, summary: summary, detail: _detail});
  }
}
