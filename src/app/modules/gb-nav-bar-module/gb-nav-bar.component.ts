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

  public isDataSelection = true;
  public isAnalysis = false;
  public isExport = false;

  public queryName: string;

  constructor(private router: Router,
              public queryService: QueryService) {
    this.queryName = '';
  }

  ngOnInit() {
    this._items = [
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
    this.isDataSelection = (whichStep === 'data-selection' || whichStep === '');
    this.isAnalysis = (whichStep === 'analysis');
    this.isExport = (whichStep === 'export');

    if (this.isDataSelection) {
      this._activeItem = this._items[0];
    } else if (this.isAnalysis) {
      this._activeItem = this._items[1];
    } else if (this.isExport) {
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

