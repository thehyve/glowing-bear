/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component,  Renderer2} from '@angular/core';
import {NavbarService} from '../../services/navbar.service';
import {TermSearchService} from '../../services/term-search.service';
import {OntologyNavbarService} from '../../services/ontology-navbar.service';
import {SavedCohortsPatientListService} from '../../services/saved-cohorts-patient-list.service';

@Component({
  selector: 'gb-side-panel',
  templateUrl: './gb-side-panel.component.html',
  styleUrls: ['./gb-side-panel.component.css']
})
export class GbSidePanelComponent {
  constructor(public navbarService: NavbarService,
              public savedCohortsPatientListService: SavedCohortsPatientListService,
              public ontologyNavbarService: OntologyNavbarService,
              public termSearchService: TermSearchService,
              public renderer: Renderer2) { }

    ngAfterViewInit() {
      this.termSearchService.searchResultObservable.subscribe(searchResults => {
        setTimeout(() => {
          const elems = document.querySelectorAll('.term-search p-header');
          elems.forEach((elemResult, resultIndex) => {
            this.renderer.listen(elemResult, 'dragstart', searchResults[resultIndex]?.handleFuncStart);
          });
        }, 0);
      });
    }
}
