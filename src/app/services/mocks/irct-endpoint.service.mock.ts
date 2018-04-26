import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {IRCTResourceDef} from '../../models/irct-models/irct-resource-definition';

@Injectable()
export class IRCTEndPointServiceMock {

  private irctResources: IRCTResourceDef[];

  constructor() {
    this.irctResources = [];
  }

  getIRCTResources(): Observable<IRCTResourceDef[]> {
    return Observable.of(this.irctResources);
  }
}
