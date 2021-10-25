/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, ViewChildren, QueryList, ElementRef} from '@angular/core';
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
  @ViewChildren('ontologyElem') elems: QueryList<any>;

  constructor(public navbarService: NavbarService,
              public savedCohortsPatientListService: SavedCohortsPatientListService,
              public ontologyNavbarService: OntologyNavbarService,
              public termSearchService: TermSearchService) { }

    ngAfterViewInit() {
      this.termSearchService.searchResultObservable.subscribe(results => {
        setTimeout(() => {
          results.forEach((result, resultIndex) => {
            this.elems.toArray()[resultIndex].__ngContext__[13][0].addEventListener('dragstart', result.handleFuncStart);
          });
        }, 0);
      });
    }
}
