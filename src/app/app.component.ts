import {Component, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {AuthorizationResult, OidcSecurityService} from 'angular-auth-oidc-client';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('parentContainer') parentContainer: any;
  @ViewChild('leftPanel') leftPanel: any;
  @ViewChild('gutter') gutter: any;
  @ViewChild('rightPanel') rightPanel: any;

  private isGutterDragged: boolean;
  private x_pos: number; // Stores x coordinate of the mouse pointer
  private x_gap: number; // Stores x gap (edge) between mouse and gutter

  constructor(private oidcSecurityService: OidcSecurityService,
              private router: Router) {

    if (this.oidcSecurityService.moduleSetup) {
      this.onOidcModuleSetup();
    } else {
      this.oidcSecurityService.onModuleSetup.subscribe(() => {
        this.onOidcModuleSetup();
      });
    }

    this.oidcSecurityService.onAuthorizationResult.subscribe(
      (authorizationResult: AuthorizationResult) => {
        this.onAuthorizationResultComplete(authorizationResult);
      });
  }

  private onOidcModuleSetup() {
    if (window.location.hash) {
      this.oidcSecurityService.authorizedCallback();
    } else {
      if ('/autologin' !== window.location.pathname) {
        localStorage.setItem('redirect', JSON.stringify(window.location.pathname));
      }

      this.oidcSecurityService.getIsAuthorized().subscribe((authorized: boolean) => {
        if (!authorized) {
          this.router.navigate(['/autologin']);
        }
      });
    }
  }

  private onAuthorizationResultComplete(authorizationResult: AuthorizationResult) {
    const path = JSON.parse(localStorage.getItem('redirect'));

    if (authorizationResult === AuthorizationResult.authorized) {
      this.router.navigate([path]);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    const parentContainerElm = this.parentContainer.nativeElement;
    const gutterElm = this.gutter.nativeElement;
    const leftPanelElm = this.leftPanel.nativeElement;
    const rightPanelElm = this.rightPanel.nativeElement;

    this.isGutterDragged = false;
    this.x_pos = 0;
    this.x_gap = 0;

    const adjustNavbarWidth = function () {
      const navbar = parentContainerElm.querySelector('.gb-navbar');
      if (navbar) {
        const leftWidth = leftPanelElm.clientWidth;
        const rightWidth = rightPanelElm.clientWidth;
        const percentage = rightWidth / (rightWidth + leftWidth + 36);
        navbar.style.width = (percentage * 100) + '%';
      }
    }

    const onMouseDown = function (event) {
      // preventDefault() is used to
      // prevent browser change cursor icon while dragging
      event.preventDefault();
      this.isGutterDragged = true;
      this.x_gap = this.x_pos - gutterElm.offsetLeft;
      return false;
    };

    const onMouseMove = function (event) {
      this.x_pos = event.pageX;
      if (this.isGutterDragged) {
        let leftW = this.x_pos - this.x_gap;
        leftPanelElm.style.width = leftW + 'px';
        let bound = parentContainerElm.getBoundingClientRect();
        let rightW = bound.width - leftW - 10 - 2 * 3;
        rightPanelElm.style.width = rightW + 'px';
        adjustNavbarWidth();
      }
    };

    const onMouseUp = function (event) {
      this.isGutterDragged = false;
    };

    const onResize = function (event) {
      if (leftPanelElm.style.width !== '') {
        leftPanelElm.style.width = '';
      }
      if (rightPanelElm.style.width !== '') {
        rightPanelElm.style.width = '';
      }
      adjustNavbarWidth();
    };

    gutterElm.addEventListener('mousedown', onMouseDown.bind(this));
    parentContainerElm.addEventListener('mousemove', onMouseMove.bind(this));
    parentContainerElm.addEventListener('mouseup', onMouseUp.bind(this));
    window.addEventListener('resize', onResize.bind(this));
  }

  ngOnDestroy(): void {
    this.oidcSecurityService.onModuleSetup.unsubscribe();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }

}
