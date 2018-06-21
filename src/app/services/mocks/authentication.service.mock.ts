import {Injectable, OnDestroy} from '@angular/core';
import {AuthenticationMethod} from '../authentication/authentication-method';
import {AsyncSubject} from 'rxjs/AsyncSubject';

@Injectable()
export class AuthenticationServiceMock implements OnDestroy {

  private authenticationMethod: AuthenticationMethod;

  constructor() {
  }

  public load() {
  }

  ngOnDestroy(): void {
  }

  logout() {
  }

  get authorised(): AsyncSubject<boolean> {
    return this.authenticationMethod.authorised;
  }
}
