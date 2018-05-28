import {Injectable, OnDestroy} from '@angular/core';

@Injectable()
export class AuthenticationServiceMock implements OnDestroy {

  constructor() { }

  public load() {  }

  ngOnDestroy(): void {  }

  logout() {  }
}
