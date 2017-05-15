import { Component, OnInit } from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  isDashboard = true;
  isDataSelection = false;
  isAnalysis = false;
  isExport = false;

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let whichStep = event.urlAfterRedirects.split('/')[1].split('#')[0];
        this.updateNavbar(whichStep);
      }
    });
  }

  ngOnInit() {
  }

  updateNavbar(whichStep: string) {
    this.isDashboard = (whichStep === 'dashboard' || whichStep == '');
    this.isDataSelection = (whichStep === 'data-selection');
    this.isAnalysis = (whichStep === 'analysis');
    this.isExport = (whichStep === 'export');
  }

}

