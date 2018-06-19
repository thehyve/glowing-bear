import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AuthenticationMethod} from '../authentication/authentication-method';

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

  get authorised(): BehaviorSubject<boolean> {
    return this.authenticationMethod.authorised;
  }
}
