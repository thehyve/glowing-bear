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
