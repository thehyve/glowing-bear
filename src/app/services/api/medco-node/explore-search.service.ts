/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2018 - 2019 EPFL LDS (LCA1) EPFL
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, Injector } from '@angular/core';
import { AppConfig } from '../../../config/app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { TreeNode } from '../../../models/tree-models/tree-node';
import { TreeNodeType } from '../../../models/tree-models/tree-node-type';
import { ConceptType } from '../../../models/constraint-models/concept-type';
import { MedcoNetworkService } from '../medco-network.service';
import { ApiEndpointService } from '../../api-endpoint.service';

@Injectable()
export class ExploreSearchService {

  /**
   * If the configuration key `medco-cothority-key-url` is present, the file will be fetched and the service enabled.
   * @param {AppConfig} config
   * @param http
   * @param medcoNetworkService
   * @param apiEndpointService
   * @param injector
   */
  constructor(private config: AppConfig,
    private http: HttpClient,
    private medcoNetworkService: MedcoNetworkService,
    private apiEndpointService: ApiEndpointService,
    private injector: Injector) { }


  private exploreSearchConcept(operation: string, root: string): Observable<TreeNode[]> {
    return this.apiEndpointService.postCall(
      'node/explore/search/concept',
      { operation: operation, path: root }
    ).pipe(
      map((searchResp: object) => {
        return (searchResp['results'] as object[]).map((treeNodeObj: object) => {
          let treeNode = new TreeNode();
          treeNode.path = treeNodeObj['path'];
          treeNode.appliedPath = treeNodeObj['appliedPath'];
          treeNode.name = treeNodeObj['name'];
          treeNode.displayName = treeNodeObj['displayName'];
          treeNode.description = `${treeNodeObj['displayName']} (${treeNodeObj['code']})`;
          treeNode.conceptCode = treeNodeObj['code'];
          treeNode.metadata = treeNodeObj['metadata'];
          // leaf in the database is not a leaf in the tree, as modifiers
          // are displayed as children
          treeNode.leaf = false;
          treeNode.encryptionDescriptor = treeNodeObj['medcoEncryption'];

          switch ((treeNodeObj['type'] as string).toLowerCase()) {
            case 'concept':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.SIMPLE;
              break;

            case 'concept_numeric':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.NUMERICAL;
              break;

            case 'concept_enum':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.CATEGORICAL;
              break;

            case 'concept_text':
              treeNode.nodeType = TreeNodeType.CONCEPT;
              treeNode.conceptType = ConceptType.TEXT;
              break;

            case 'genomic_annotation':
              treeNode.nodeType = TreeNodeType.GENOMIC_ANNOTATION;
              treeNode.conceptType = undefined;
              treeNode.leaf = true;
              break;

            case 'modifier':
              treeNode.nodeType = TreeNodeType.MODIFIER;
              treeNode.conceptType = undefined;
              treeNode.leaf = true;
              break;

            case 'modifier_folder':
              treeNode.nodeType = TreeNodeType.MODIFIER_FOLDER;
              treeNode.conceptType = undefined;
              break;

            case 'modifier_container':
              treeNode.nodeType = TreeNodeType.MODIFIER_CONTAINER;
              treeNode.conceptType = undefined;
              break;

            default:
            case 'container':
              treeNode.nodeType = TreeNodeType.UNKNOWN;
              treeNode.conceptType = undefined;
              break;
          }

          treeNode.depth = treeNode.path.split('/').length - 2;
          treeNode.children = [];
          treeNode.childrenAttached = false;

          return treeNode;
        })
      })
    );
  }
  /**
   * Perform search concept children in ontology.
   *
   * @param {string} root - the path to the specific tree node, must include the first slash
   *
   * @returns {Observable<Object>}
   */
  exploreSearchConceptChildren(root: string): Observable<TreeNode[]> {
    return this.exploreSearchConcept('children', root)
  }


  private exploreSearchModifier(operation: string, root: string, appliedPath: string, appliedConcept: string): Observable<TreeNode[]> {
    return this.apiEndpointService.postCall(
      'node/explore/search/modifier',
      { operation: operation, path: root, appliedPath: appliedPath, appliedConcept: appliedConcept }
    ).pipe(
      map((searchResp: object) => {
        return (searchResp['results'] as object[]).map((treeNodeObj: object) => {
          let treeNode = new TreeNode()
          treeNode.path = treeNodeObj['path']
          treeNode.appliedPath = treeNodeObj['appliedPath'];
          treeNode.name = treeNodeObj['name']
          treeNode.displayName = treeNodeObj['displayName']
          treeNode.description = `${treeNodeObj['displayName']} (${treeNodeObj['code']})`
          treeNode.conceptCode = treeNodeObj['code']
          treeNode.metadata = treeNodeObj['metadata']
          treeNode.leaf = false;
          treeNode.encryptionDescriptor = treeNodeObj['medcoEncryption']

          switch ((treeNodeObj['type'] as string).toLowerCase()) {
            case 'modifier':
              treeNode.nodeType = TreeNodeType.MODIFIER;
              treeNode.conceptType = undefined;
              treeNode.leaf = true;
              break;

            case 'modifier_folder':
              treeNode.nodeType = TreeNodeType.MODIFIER_FOLDER;
              treeNode.conceptType = undefined;
              break;

            case 'modifier_container':
              treeNode.nodeType = TreeNodeType.MODIFIER_CONTAINER;
              treeNode.conceptType = undefined;
              break;
            default:
              treeNode.nodeType = TreeNodeType.UNKNOWN;
              treeNode.conceptType = undefined;
              break;

          }

          treeNode.depth = treeNode.path.split('/').length - 2;
          treeNode.children = [];
          treeNode.childrenAttached = false;
          return treeNode
        }
        )
      }))
  }

  /**
   * Perform search modifier children in ontology.
   *
   * @param {string} root - the path to the specific tree node, must include the first slash
   *
   * @returns {Observable<Object>}
   */
  exploreSearchModifierChildren(root: string, appliedPath: string, appliedConcept: string): Observable<TreeNode[]> {
    return this.exploreSearchModifier('children', root, appliedPath, appliedConcept)
  }
}
