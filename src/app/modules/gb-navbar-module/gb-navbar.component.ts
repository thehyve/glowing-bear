import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {MenuItem} from 'primeng/components/common/api';
import {QueryService} from '../../services/query.service';
import {NavbarService} from '../../services/navbar.service';
import {MessageService} from '../../services/message.service';

@Component({
  selector: 'gb-nav-bar',
  templateUrl: './gb-navbar.component.html',
  styleUrls: ['./gb-navbar.component.css']
})
export class GbNavbarComponent implements OnInit {

  public queryName: string;

  constructor(private router: Router,
              private navbarService: NavbarService,
              private messageService: MessageService,
              private queryService: QueryService) {
    this.queryName = '';
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let whichStep = event.urlAfterRedirects.split('/')[1].split('#')[0];
        this.navbarService.updateNavbar(whichStep);
      }
    });
  }

  get items(): MenuItem[] {
    return this.navbarService.items;
  }

  set items(value: MenuItem[]) {
    this.navbarService.items = value;
  }

  get activeItem(): MenuItem {
    return this.navbarService.activeItem;
  }

  set activeItem(value: MenuItem) {
    this.navbarService.activeItem = value;
  }

  get isDataSelection(): boolean {
    return this.navbarService.isDataSelection;
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
      this.messageService.alert('error', 'Please specify the query name.', '');
    }
  }
}

