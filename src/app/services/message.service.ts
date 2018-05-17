import { Injectable } from '@angular/core';

@Injectable()
export class MessageService {

  /*
   * The alert messages (for PrimeNg message UI) that informs the user
   * whether there is an error saving subject/observation set,
   * or the saving has been successful
   */
  private _alertMessages = [];

  constructor() { }

  public alert(summary: string, detail: string, severity: string) {
    this.alertMessages.length = 0;
    this.alertMessages.push({severity: severity, summary: summary, detail: detail});
  }

  get alertMessages(): Array<object> {
    return this._alertMessages;
  }

  set alertMessages(value: Array<object>) {
    this._alertMessages = value;
  }
}
