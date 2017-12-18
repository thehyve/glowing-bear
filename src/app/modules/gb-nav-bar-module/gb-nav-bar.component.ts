import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {MenuItem} from 'primeng/components/common/api';
import {QueryService} from '../../services/query.service';

@Component({
  selector: 'gb-nav-bar',
  templateUrl: './gb-nav-bar.component.html',
  styleUrls: ['./gb-nav-bar.component.css']
})
export class GbNavBarComponent implements OnInit {

  private _items: MenuItem[];
  private _activeItem: MenuItem;

  public isDashboard = true;
  public isDataSelection = false;
  public isAnalysis = false;

  public queryName: string;

  constructor(private router: Router,
              public queryService: QueryService) {
    this.queryName = '';
  }

  ngOnInit() {
    this._items = [
      {label: 'Dashboard', routerLink: '/dashboard'},
      {label: 'Data Selection', routerLink: '/data-selection'},
      {label: 'Analysis', routerLink: '/analysis'}
    ];
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let whichStep = event.urlAfterRedirects.split('/')[1].split('#')[0];
        this.updateNavbar(whichStep);
      }
    });
  }

  updateNavbar(whichStep: string) {
    this.isDashboard = (whichStep === 'dashboard' || whichStep === '');
    this.isDataSelection = (whichStep === 'data-selection');
    this.isAnalysis = (whichStep === 'analysis');

    if (this.isDashboard) {
      this._activeItem = this._items[0];
    } else if (this.isDataSelection) {
      this._activeItem = this._items[1];
    } else if (this.isAnalysis) {
      this._activeItem = this._items[2];
    }
  }

  get items(): MenuItem[] {
    return this._items;
  }

  set items(value: MenuItem[]) {
    this._items = value;
  }

  get activeItem(): MenuItem {
    return this._activeItem;
  }

  set activeItem(value: MenuItem) {
    this._activeItem = value;
  }

  /**
   * Prevent the default behavior of node drop
   * @param event
   */
  preventNodeDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  saveQuery() {
    let name = this.queryName ? this.queryName.trim() : '';
    let queryNameIsValid = name !== '';
    if (queryNameIsValid) {
      this.queryService.saveQuery(name);
      this.queryName = '';
    } else {
      const summary = 'Please specify the query name.';
      this.queryService.alertMessages.length = 0;
      this.queryService.alertMessages.push({severity: 'warn', summary: summary, detail: ''});
    }
  }
}

