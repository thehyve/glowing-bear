/**
 * Copyright 2017 - 2018  The Hyve B.V.
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
import {QueryService} from '../../services/query.service';
import {TransmartResourceService} from '../../services/transmart-services/transmart-resource.service';

@Component({
  selector: 'gb-main',
  templateUrl: './gb-main.component.html',
  styleUrls: ['./gb-main.component.css']
})
export class GbMainComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
              private resourceService: ResourceService,
              private transmartResourceService: TransmartResourceService,
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private queryService: QueryService) {
  }

  ngOnInit() {
  }

}
