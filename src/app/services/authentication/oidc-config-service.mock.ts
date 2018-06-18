import {EventEmitter} from '@angular/core';

export class OidcConfigServiceMock {

  private _url: string;
  private _configurationLoadedEvent = new EventEmitter<boolean>();

  load_using_stsServer(url: string) {
    this._url = url;
    this._configurationLoadedEvent.emit(true);
  }

  get wellKnownEndpoints() {
    return {};
  }

  get onConfigurationLoaded(): EventEmitter<boolean> {
    return this._configurationLoadedEvent;
  }

}
