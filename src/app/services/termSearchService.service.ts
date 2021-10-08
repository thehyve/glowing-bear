/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 EPFL LDS
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, Injector } from '@angular/core';
import { ExploreSearchService } from './api/medco-node/explore-search.service';
import { TreeNodeService } from './tree-node.service';
import { ErrorHelper } from '../utilities/error-helper';
import { DropMode } from '../models/drop-mode';
import { TreeNode } from '../models/tree-models/tree-node';

interface NodeFullPath {
  name: string;
  isBold: boolean;
}

interface ResultType {
  name: string;
  fullPath: NodeFullPath[];
}

const getPathList = (path: string) => {
  const splittedPath = path.split('/').filter(value => value !== '');

  const pathList: string[] = [];

  splittedPath.forEach((_, index) => {
    pathList.push(splittedPath.slice(0, index + 1).reduce((result, value) => `${result}${value}/`, '/I2B2/'));
  });

  return pathList;
}

@Injectable()
export class TermSearchService {

  private _termSearch = '';

  private exploreSearchService: ExploreSearchService;
  private _results: ResultType[];
  private _isLoading = false;

  constructor(private treeNodeService: TreeNodeService,
    private injector: Injector) {
    this.results = [];

    this.exploreSearchService = this.injector.get(ExploreSearchService);
  }

  addInResults(node: TreeNode, displayNameList: string[], nodesSize: number, searchConceptInfo?: TreeNode[]) {
    const formattedResult = {
      name: node.name,
      fullPath: displayNameList.reverse().reduce((result, displayName) => [
        ...result, {
          name: displayName,
          isBold: !result.find(({ isBold }) => isBold) && displayName.toLowerCase().indexOf(this.termSearch.toLowerCase()) !== -1

      }], []).reverse()
    };
    let resultIndex = -1;
    if (!this.results.find(({ name: resultName }) => resultName === node.name)) { // Not found in this.results, add
      resultIndex = this.results.push(formattedResult) - 1;
      if (resultIndex === nodesSize - 1) {
        this.isLoading = false;
      }
    } else { // Found in this.results, replace
      resultIndex = this.results.findIndex(({ name: resultName }) => resultName === node.name);
      this.results[resultIndex] = formattedResult;
    }
    const dataObject = {
      ...node,
      ...((searchConceptInfo?.length > 0) ? { appliedConcept: searchConceptInfo[0] } : {}),
      dropMode: DropMode.TreeNode,
      metadata: undefined,
      path: `/I2B2${node.path}`,
      isModifier: () => !!searchConceptInfo
    };

    setTimeout(() => {
      const elems = document.querySelectorAll('.term-search p-accordionTab.ui-ontology-elements');
      const elem = elems[resultIndex];
      const handleDragstart = (function (event) {
        event.stopPropagation();
        this.treeNodeService.selectedTreeNode = dataObject;
      }).bind(this);
      elem.addEventListener('dragstart', handleDragstart);
    }, 0);
  }

  search() {
    this.results = [];
    this.isLoading = true;

    this.exploreSearchService.exploreSearchTerm(this.termSearch).subscribe((nodes) => {
      nodes.forEach((node) => {
        const pathList = getPathList(node.path);

        let displayNameList: string[] = new Array(pathList.length);

        pathList.forEach((value, pathListIndex) => {
          this.exploreSearchService.exploreSearchConceptInfo(value).subscribe((searchResult) => {
            displayNameList[pathListIndex] = searchResult[0].displayName;
            if (displayNameList.filter((_value) => !!_value).length === pathList.length) {
              if (node.nodeType.toLowerCase().indexOf('modifier') === -1) {
                this.addInResults(node, displayNameList, nodes.length);
              } else {
                if (node.appliedPath[node.appliedPath.length - 1] !== '/') {
                  node.appliedPath = `${node.appliedPath}/`;
                }
                this.exploreSearchService.exploreSearchConceptInfo(`/I2B2${node.appliedPath}`).subscribe((searchConceptInfo) => {
                  this.addInResults(node, displayNameList, nodes.length, searchConceptInfo);
                })
              }
            }
          });
        });
      });
    }, (err) => {
      ErrorHelper.handleError('Failed to search', err);
    });
  }

  onSearch() {
   this.search();
  }

  onTermChange(event: any) {
    this.termSearch = event.target.value;
    if (this.termSearch.length > 2) {
      this.search();
    }
  }

  get termSearch(): string {
    return this._termSearch;
  }

  set termSearch(value: string) {
    this._termSearch = value;
  }

  get results(): ResultType[] {
    return this._results;
  }

  set results(value: ResultType[]) {
    this._results = value;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    this._isLoading = value;
  }
}
