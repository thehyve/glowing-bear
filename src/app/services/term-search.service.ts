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
import { ReplaySubject } from 'rxjs';
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
  handleFuncStart?: (e: Event) => void;
  conceptCode: string;
}

/**
 * This service manage the API calls to the backend for the search functionality.
 */
@Injectable()
export class TermSearchService {

  private _searchTerm = '';

  private exploreSearchService: ExploreSearchService;
  private _results: ResultType[];
  private _isLoading = false;
  private _isNoResults = false;

  public searchResultObservable: ReplaySubject<ResultType[]> = new ReplaySubject();

  constructor(private treeNodeService: TreeNodeService,
    private injector: Injector) {
    this.results = [];

    this.exploreSearchService = this.injector.get(ExploreSearchService);
  }

  addInResults(node: TreeNode, displayNameList: string[], nodesSize: number, appliedConcept?: TreeNode) {
    const dataObject = node.clone();

    dataObject.dropMode = DropMode.TreeNode;
    dataObject.path = `${node.path}`;
    dataObject.metadata = undefined;
    if (appliedConcept) {
      dataObject.appliedConcept = appliedConcept;
    }

    const formattedResult: ResultType = {
      name: node.name,
      conceptCode: node.conceptCode,
      fullPath: displayNameList.reduce((result, displayName) => [
        ...result, {
          name: displayName,
          isBold: !result.find(({ isBold }) => isBold) && displayName.toLowerCase().indexOf(this.searchTerm.toLowerCase()) !== -1
      }], []).reverse(),
      handleFuncStart: (function (event) {
        event.stopPropagation();
        this.treeNodeService.selectedTreeNode = dataObject;
      }).bind(this)
    };

    let resultIndex = -1;
    if (!this.results.find(({ conceptCode: resultConceptCode }) => resultConceptCode === node.conceptCode)) { // Not found in this.results, add
      resultIndex = this.results.push(formattedResult) - 1;
      if (resultIndex === nodesSize - 1) {
        this.isLoading = false;
      }
    } else { // Found in this.results, replace
      resultIndex = this.results.findIndex(({ name: resultName }) => resultName === node.name);
      this.results[resultIndex] = formattedResult;
    }

    this.addHandlers();
  }

  addHandlers() {
    this.searchResultObservable.next(this.results);
  }

  search() {
    this.results = [];
    this.isLoading = true;
    this.isNoResults = false;

    const searchTerm = this.searchTerm;

    this.exploreSearchService.exploreSearchTerm(this.searchTerm).subscribe((nodes) => {
      if (searchTerm !== this.searchTerm) {
        return;
      }
      if (nodes.length === 0) {
        this.isLoading = false;
        this.isNoResults = true;
      }
      nodes.forEach((node) => {
        let actualNode = node;
        let displayNameList: string[] = [actualNode.displayName];

        while (actualNode.parent) {
          actualNode = actualNode.parent;
          displayNameList.push(actualNode.displayName);
        }

       if (node.nodeType.toLowerCase().indexOf('modifier') === -1) {
          this.addInResults(node, displayNameList, nodes.length);
        } else {
          this.addInResults(node, displayNameList, nodes.length, node.parent);
        }
      });
    }, (err) => {
      ErrorHelper.handleError('Failed to search', err);
      this.isLoading = false;
    });
  }

  onTermChange(event: any) {
    this.searchTerm = event.target.value;
  }

  onSearch() {
    if (this.searchTerm.length) {
      this.search();
    }
  }

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this._searchTerm = value;
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

  get isNoResults(): boolean {
    return this._isNoResults;
  }

  set isNoResults(value: boolean) {
    this._isNoResults = value;
  }
}
