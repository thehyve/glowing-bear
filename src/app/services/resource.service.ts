import { Injectable } from '@angular/core';

@Injectable()
export class ResourceService {

  private _IS_AUTHENTICATED: boolean;

  constructor() {
    this._IS_AUTHENTICATED = false;
  }

  isAuthenticated(): boolean {
    return this._IS_AUTHENTICATED;
  }

  authenticate(): void {
    console.log('log in here: ', this.isAuthenticated());
  }

}
