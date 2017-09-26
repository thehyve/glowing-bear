import {Component, OnInit, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {TreeNode} from 'primeng/components/common/api';
import {ConstraintService} from '../../../../services/constraint.service';
import {OverlayPanel} from 'primeng/components/overlaypanel/overlaypanel';
import {trigger, transition, animate, style} from '@angular/animations';
import {DropMode} from '../../../../models/drop-mode';
import {DimensionRegistryService} from '../../../../services/dimension-registry.service';
import {ResourceService} from '../../../../services/resource.service';
import {Constraint} from '../../../../models/constraints/constraint';
import {CombinationConstraint} from '../../../../models/constraints/combination-constraint';
import {StudyConstraint} from '../../../../models/constraints/study-constraint';
import {CombinationState} from '../../../../models/constraints/combination-state';

@Component({
  selector: 'tree-nodes',
  templateUrl: './tree-nodes.component.html',
  styleUrls: ['./tree-nodes.component.css'],
  animations: [
    trigger('notifyState', [
      transition('loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 0.5)'
        }),
        animate('1000ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class TreeNodesComponent implements OnInit, AfterViewInit {

  @ViewChild('treeNodeMetadataPanel') treeNodeMetadataPanel: OverlayPanel;

  // the observer that monitors the DOM element change on the tree
  observer: MutationObserver;
  // a utility variable storing temporary information on the node that is being expanded
  expansionStatus: any;
  // the variable holding the current metadata overlay content being shown
  metadataContent: any = [];
  // the search term in the text input box to filter the tree
  searchTerm: string;

  constructor(private constraintService: ConstraintService,
              private resourceService: ResourceService,
              public dimensionRegistryService: DimensionRegistryService,
              private element: ElementRef) {
    this.expansionStatus = {
      expanded: false,
      treeNodeElm: null,
      treeNode: null
    };
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

  /**
   * Update the contextmenu popup (right click) content
   * by the given metadata object from a treenode
   * @param metadata
   */
  updateMetadataContent(metadata) {
    this.metadataContent = [];
    for (let key in metadata) {
      this.metadataContent.push({
        key: key,
        val: metadata[key]
      });
    }
  }

  /**
   * Add event listeners to the newly appended tree nodes
   * @param treeNodeElements
   * @param treeNodes
   */
  updateEventListeners(treeNodeElements, treeNodes) {
    let index = 0;
    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodes[index];
      let dataObjectType = dataObject['type'];
      let metadata = dataObject['metadata'];
      let treeNodeElm = elm.querySelector('li.ui-treenode');

      let handleDragstart = (function (event) {
        event.stopPropagation();
        dataObject['dropMode'] = DropMode.TreeNode;
        this.constraintService.selectedNode = dataObject;
      }).bind(this);

      let handleContextmenu = (function (event) {
        event.stopPropagation();
        event.preventDefault();
        this.updateMetadataContent(metadata);
        this.treeNodeMetadataPanel.toggle(event);
        let div = this.treeNodeMetadataPanel.el.nativeElement.children[0];
        div.style.left = event.clientX + 'px';
        div.style.top = (event.layerY + 75) + 'px';
      }).bind(this);

      // if the data object type belongs to the listed types
      if (this.constraintService.validTreeNodeTypes.includes(dataObjectType)) {
        treeNodeElm.addEventListener('dragstart', handleDragstart);
      }
      // if metadata exits
      if (metadata) {
        treeNodeElm.addEventListener('contextmenu', handleContextmenu);
      }

      let uiTreeNodeChildrenElm = elm.querySelector('.ui-treenode-children');
      if (uiTreeNodeChildrenElm) {
        this.updateEventListeners(uiTreeNodeChildrenElm.children, dataObject.children);
      }
      index++;
    }
  }

  update() {
    if (this.expansionStatus['expanded']) { this.constraintService.updateExpandedTreeNodesCounts();
      let treeNodeElm = this.expansionStatus['treeNodeElm'];
      let treeNode = this.expansionStatus['treeNode'];
      let newChildren = treeNodeElm.querySelector('ul.ui-treenode-children').children;
      this.updateEventListeners(newChildren, treeNode.children);

      this.expansionStatus['expanded'] = false;
      this.expansionStatus['treeNodeElm'] = null;
      this.expansionStatus['treeNode'] = null;
    }
    this.removeFalsePrimeNgClasses();
  }

  expandNode(event) {
    if (event.node) {
      this.expansionStatus['expanded'] = true;
      this.expansionStatus['treeNodeElm'] = event.originalEvent.target.parentElement.parentElement;
      this.expansionStatus['treeNode'] = event.node;
    }
  }

  /**
   * Recursively filter the tree nodes and return the copied tree nodes that match,
   * return the reduced tree as a new instance
   * (An alternative solution as backup)
   * @param treeNodes
   * @param field
   * @param filterWord
   * @returns {Array}
   */
  filterWithCopiedTreeNodes(treeNodes, field, filterWord) {
    let result = {
      hasMatching: false,
      matchingTreeNodes: [] // matchingTreeNodes is a subset of treeNodes
    };
    for (let node of treeNodes) {
      let nodeCopy = Object.assign({}, node);
      nodeCopy['expanded'] = true;
      let fieldString = node[field].toLowerCase();
      if (fieldString.includes(filterWord)) {
        result.hasMatching = true;
        result.matchingTreeNodes.push(nodeCopy);
      }
      if (node['children'] && node['children'].length > 0) {
        let subResult = this.filterWithCopiedTreeNodes(node['children'], field, filterWord);
        if (subResult.hasMatching) {
          nodeCopy['children'] = subResult.matchingTreeNodes;
          result.hasMatching = true;
          if (result.matchingTreeNodes.indexOf(nodeCopy) === -1) {
            result.matchingTreeNodes.push(nodeCopy);
          }
        }
      }
    }
    return result;
  }

  /**
   * Recursively filter the original tree nodes in the dimension registry,
   * assign highlight css classes to tree nodes
   * @param {TreeNode[]} treeNodes
   * @param {string} field
   * @param filterWord
   * @returns {{hasMatching: boolean}}
   */
  filterWithHighlightTreeNodes(treeNodes: TreeNode[], field: string, filterWord) {
    let result = {
      hasMatching: false
    };
    // if the tree nodes are defined
    if (treeNodes) {
      // if there is a filter word
      if (filterWord.length > 0) {
        for (let node of treeNodes) {
          node['expanded'] = false;
          node['styleClass'] = undefined;
          let fieldString = node[field].toLowerCase();
          if (fieldString.includes(filterWord)) {
            result.hasMatching = true;
            if (node['children'] && node['children'].length > 0) {
              node['styleClass'] = 'highlight-treenode is-not-leaf';
            } else {
              node['styleClass'] = 'highlight-treenode';
            }
          } else {
            node['styleClass'] = undefined;
          }
          if (node['children'] && node['children'].length > 0) {
            let subResult =
              this.filterWithHighlightTreeNodes(node['children'], field, filterWord);
            if (subResult.hasMatching) {
              result.hasMatching = true;
              node['expanded'] = true;
            }
          }
        }
      } else { // if the filter word is empty
        for (let node of treeNodes) {
          node['expanded'] = false;
          if (node['children'] && node['children'].length > 0) {
            node['styleClass'] = 'is-not-leaf';
          } else {
            node['styleClass'] = undefined;
          }
          this.filterWithHighlightTreeNodes(node['children'], field, filterWord);
        }
      }
    }
    return result;
  }

  /**
   * PrimeNg tree is behaving strangely when dynamically adding custom class to tree nodes:
   * sometimes a tree node with children is marked with the 'ui-treenode-leaf' class.
   * Therefore, this function is to remove any false ui-treenode-leaf classes.
   */
  removeFalsePrimeNgClasses() {
    let leaves = this.element.nativeElement.querySelectorAll('.ui-treenode-leaf');
    if (leaves) {
      for (let supposedLeaf of leaves) {
        if (supposedLeaf.classList.contains('is-not-leaf')) {
          supposedLeaf.classList.remove('ui-treenode-leaf');
        }
      }
    }
  }

  /**
   * User typing in the input box of the filter search box triggers this handler
   * @param event
   */
  onFiltering(event) {
    let filterWord = this.searchTerm.trim().toLowerCase();
    this.filterWithHighlightTreeNodes(this.dimensionRegistryService.treeNodes, 'label', filterWord);
    this.removeFalsePrimeNgClasses();
  }

  /**
   * User selecting a tree node triggers this handler
   * @param event
   */
  onNodeSelect(event) {
    this.dimensionRegistryService.updateSelectedTreeNodes();
  }

  /**
   * User unselecting a tree node triggers this handler
   * @param event
   */
  onNodeUnselect(event) {
    this.dimensionRegistryService.updateSelectedTreeNodes();
  }

}
