/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {QueryService} from '../../../../services/query.service';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNode} from '../../../../models/tree-models/tree-node';
import {DropMode} from '../../../../models/drop-mode';
import {FormatHelper} from '../../../../utilities/format-helper';
import {MessageHelper} from '../../../../utilities/message-helper';
import {TreeNodeType} from '../../../../models/tree-models/tree-node-type';

@Component({
  selector: 'gb-summary',
  templateUrl: './gb-summary.component.html',
  styleUrls: ['./gb-summary.component.css']
})
export class GbSummaryComponent implements OnInit {

  constructor(private queryService: QueryService,
              private treeNodeService: TreeNodeService,
              private element: ElementRef) {
  }

  ngOnInit() {
  }

  clearAll() {
    this.queryService.clearAll();
    MessageHelper.alert('success', 'All selections are cleared.');
  }

  get globalCount(): string {
    return FormatHelper.formatCountNumber(this.queryService.globalCount);
  }

}
