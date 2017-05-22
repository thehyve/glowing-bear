import { Component, OnInit } from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {MenuItem} from "primeng/components/common/api";

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  private items: MenuItem[];
  private activeItem: MenuItem;

  isDashboard = true;
  isDataSelection = false;
  isAnalysis = false;
  isExport = false;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.items = [
      {label: 'Dashboard', routerLink: '/dashboard'},
      {label: 'Data Selection', routerLink: '/data-selection'},
      {label: 'Analysis', routerLink: '/analysis'},
      {label: 'Export', routerLink: '/export'}
    ];
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let whichStep = event.urlAfterRedirects.split('/')[1].split('#')[0];
        this.updateNavbar(whichStep);
      }
    });
  }

  updateNavbar(whichStep: string) {
    this.isDashboard = (whichStep === 'dashboard' || whichStep == '');
    this.isDataSelection = (whichStep === 'data-selection');
    this.isAnalysis = (whichStep === 'analysis');
    this.isExport = (whichStep === 'export');

    if(this.isDashboard) {
      this.activeItem = this.items[0];
    }
    else if(this.isDataSelection) {
      this.activeItem = this.items[1];
    }
    else if(this.isAnalysis) {
      this.activeItem = this.items[2];
    }
    else if(this.isExport) {
      this.activeItem = this.items[3];
    }
  }


}

