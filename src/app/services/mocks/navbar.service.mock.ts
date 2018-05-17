import {MenuItem} from 'primeng/api';

export class NavbarServiceMock {
  private _items: MenuItem[];
  private _activeItem: MenuItem;

  private _isDataSelection = true;
  private _isAnalysis = false;
  private _isExport = false;


  constructor() {
    this.items = [
      {label: 'Data Selection', routerLink: '/data-selection'},
      {label: 'Analysis', routerLink: '/analysis'},
      {label: 'Export', routerLink: '/export'}
    ];
  }

  updateNavbar(whichStep: string) {
    this.isDataSelection = (whichStep === 'data-selection' || whichStep === '');
    this.isAnalysis = (whichStep === 'analysis');
    this.isExport = (whichStep === 'export');

    if (this.isDataSelection) {
      this.activeItem = this._items[0];
    } else if (this.isAnalysis) {
      this.activeItem = this._items[1];
    } else if (this.isExport) {
      this.activeItem = this._items[2];
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

  get isDataSelection(): boolean {
    return this._isDataSelection;
  }

  set isDataSelection(value: boolean) {
    this._isDataSelection = value;
  }

  get isAnalysis(): boolean {
    return this._isAnalysis;
  }

  set isAnalysis(value: boolean) {
    this._isAnalysis = value;
  }

  get isExport(): boolean {
    return this._isExport;
  }

  set isExport(value: boolean) {
    this._isExport = value;
  }
}
