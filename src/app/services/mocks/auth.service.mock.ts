import {Injectable, OnDestroy} from '@angular/core';

@Injectable()
export class AuthServiceMock implements OnDestroy {

  constructor() { }

  public load() {  }

  ngOnDestroy(): void {  }

  logout() {  }
}
