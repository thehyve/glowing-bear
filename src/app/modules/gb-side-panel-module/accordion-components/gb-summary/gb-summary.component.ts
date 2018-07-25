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
import {TreeNode} from 'primeng/api';
import {DropMode} from '../../../../models/drop-mode';
import {FormatHelper} from '../../../../utilities/format-helper';
import {CrossTableService} from '../../../../services/cross-table.service';
import {MessageHelper} from '../../../../utilities/message-helper';

@Component({
  selector: 'gb-summary',
  templateUrl: './gb-summary.component.html',
  styleUrls: ['./gb-summary.component.css']
})
export class GbSummaryComponent implements OnInit, AfterViewInit {

  // the observer that monitors the DOM element change on the tree
  observer: MutationObserver;

  constructor(private queryService: QueryService,
              private treeNodeService: TreeNodeService,
              private crossTableService: CrossTableService,
              private element: ElementRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(this.update.bind(this));
    const config = {
      attributes: false,
      subtree: true,
      childList: true,
      characterData: false
    };
    this.observer.observe(this.element.nativeElement, config);
  }

  private update() {
    let treeNodeContainer = this.element.nativeElement.querySelector('.ui-tree-container');
    if (treeNodeContainer) {
      let treeNodeElements = treeNodeContainer.children;
      this.updateEventListeners(treeNodeElements, this.finalTreeNodes);
    }
  }

  private updateEventListeners(treeNodeElements: any[], treeNodes: TreeNode[]) {
    let index = 0;
    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodes[index];
      let dataObjectType = dataObject['type'];
      let treeNodeElm = elm.querySelector('li.ui-treenode');

      let handleDragstart = (function (event) {
        event.stopPropagation();
        dataObject['dropMode'] = DropMode.TreeNode;
        this.treeNodeService.selectedTreeNode = dataObject;
      }).bind(this);

      // if the data object type belongs to the listed types
      if (this.treeNodeService.validTreeNodeTypes.includes(dataObjectType)
        && !treeNodeElm.hasAttribute('hasEventListener')) {
        treeNodeElm.setAttribute('hasEventListener', true);
        treeNodeElm.addEventListener('dragstart', handleDragstart);
      }

      let uiTreeNodeChildrenElm = elm.querySelector('.ui-treenode-children');
      if (uiTreeNodeChildrenElm) {
        this.updateEventListeners(uiTreeNodeChildrenElm.children, dataObject.children);
      }
      index++;
    }
  }

  clearAll() {
    this.queryService.clearAll()
      .then(() => {
        this.crossTableService.clear();
        MessageHelper.alert('success', 'All selections are cleared.');
      });
  }

  get subjectCount(): string {
    return FormatHelper.formatCountNumber(this.queryService.counts_2.subjectCount);
  }

  get observationCount(): string {
    return FormatHelper.formatCountNumber(this.queryService.counts_2.observationCount);
  }

  get finalTreeNodes(): TreeNode[] {
    return this.treeNodeService.finalTreeNodes;
  }

  get showObservationCounts(): boolean {
    return this.queryService.showObservationCounts;
  }

}
