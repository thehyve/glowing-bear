import {Component, OnInit} from '@angular/core';
import {NavbarService} from '../../services/navbar.service';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'gb-results',
  templateUrl: './gb-results.component.html',
  styleUrls: ['./gb-results.component.css']
})
export class GbResultsComponent implements OnInit {

  constructor(public navbarService: NavbarService,
              private router: Router
  ) {
  }

  ngOnInit() {
    if (this.navbarService.activeResultItem !== undefined) {
      this.router.navigateByUrl(this.navbarService.activeResultItem.routerLink.toString())
    }
  }
}

