import {Injectable} from '@angular/core';
import {Message} from 'primeng/api';

@Injectable()
export class MessageService {

  /*
   * The alert messages (for PrimeNg message UI) that informs the user
   * whether there is an error saving subject/observation set,
   * or the saving has been successful
   */
  private _messages: Message[];

  constructor() {
    this.messages = [];
  }

  public alert(severity: string, summary: string, detail?: string) {
    let _detail = detail ? detail : '';
    // This hack is to address the bug where primneNg growl does not time out
    this.messages = [].concat(this.messages);
    this.messages.push({severity: severity, summary: summary, detail: _detail});
  }

  get messages(): Message[] {
    return this._messages;
  }

  set messages(value: Message[]) {
    this._messages = value;
  }
}
