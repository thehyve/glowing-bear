/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {MenuItem} from 'primeng/components/common/api';
import {QueryService} from '../../services/query.service';
import {NavbarService} from '../../services/navbar.service';
import {MessageHelper} from '../../utilities/message-helper';
import {AppConfig} from '../../config/app.config';

@Component({
  selector: 'gb-nav-bar',
  templateUrl: './gb-navbar.component.html',
  styleUrls: ['./gb-navbar.component.css']
})
export class GbNavbarComponent implements OnInit {
  constructor(private router: Router,
              public navbarService: NavbarService
  ) { }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let routerLink = event.urlAfterRedirects.split('#')[0];
        this.navbarService.updateNavbar(routerLink);
      }
    });
  }
}

