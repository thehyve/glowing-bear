import { Component, OnInit, OnDestroy } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'gb-auto-login',
  template: '<p> Redirecting for authentication... </p>'
})

/**
 * Component performing automatically the oidc login when loaded.
 */
export class GbAutoLoginComponent implements OnInit, OnDestroy {

  constructor(private oidcSecurityService: OidcSecurityService) {
    this.oidcSecurityService.onModuleSetup.subscribe(() => { this.onModuleSetup(); });
  }

  ngOnInit() {
    if (this.oidcSecurityService.moduleSetup) {
      this.onModuleSetup();
    }
  }

  ngOnDestroy(): void {
    this.oidcSecurityService.onModuleSetup.unsubscribe();
  }

  private onModuleSetup() {
    this.oidcSecurityService.authorize();
  }
}
