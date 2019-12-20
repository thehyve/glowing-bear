/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {ConstraintService} from '../../services/constraint.service';
import {TreeNodeService} from '../../services/tree-node.service';
import {CohortService} from '../../services/cohort.service';
import {AppConfig} from '../../config/app.config';
import {FractalisService} from '../../services/fractalis.service';
import {TransmartResourceService} from '../../services/transmart-resource.service';
import {TransmartPackerHttpService} from '../../services/http/transmart-packer-http.service';
import {TransmartHttpService} from '../../services/http/transmart-http.service';
import {GbBackendHttpService} from '../../services/http/gb-backend-http.service';
import {VariableService} from '../../services/variable.service';
import {CountService} from '../../services/count.service';
import {NavbarService} from '../../services/navbar.service';

@Component({
  selector: 'gb-main',
  templateUrl: './gb-main.component.html',
  styleUrls: ['./gb-main.component.css']
})
export class GbMainComponent implements OnInit {

  constructor(private appConfig: AppConfig,
              private authenticationService: AuthenticationService,
              private resourceService: ResourceService,
              private gbBackendHttpService: GbBackendHttpService,
              private transmartResourceService: TransmartResourceService,
              private transmartHttpService: TransmartHttpService,
              private transmartPackerHttpService: TransmartPackerHttpService,
              private countService: CountService,
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private cohortService: CohortService,
              private variableService: VariableService,
              private navbarService: NavbarService,
              private fractalisService: FractalisService) {
  }

  ngOnInit() {
  }

  get isNotAnalysis(): boolean {
    return !this.navbarService.isAnalysis;
  }
}
