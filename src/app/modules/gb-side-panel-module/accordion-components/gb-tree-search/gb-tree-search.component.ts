import {Component, Input} from '@angular/core';
import {GbTreeNode} from "../../../../models/tree-node-models/gb-tree-node";

@Component({
  selector: 'gb-tree-search',
  templateUrl: './gb-tree-search.component.html',
  styleUrls: ['./gb-tree-search.component.css']
})
export class GbTreeSearchComponent {

  private _tree: GbTreeNode[];

  get tree(): GbTreeNode[] {
    return this._tree;
  }

  @Input()
  set tree(value: GbTreeNode[]) {
    this._tree = value;
    this.onFiltering();
  }

  searchTerm: string = '';
  collectedUniqueNodeNames: Set<string>;
  hits: number;

  onFiltering() {
    this.resetHits();
    this.hits = this.highlightTreeNodes(this._tree,
      this.registerIfMatch(GbTreeSearchComponent.normalisedSearchText(this.searchTerm)));
  }

  clearFilter() {
    this.searchTerm = '';
    this.resetHits();
    this.highlightTreeNodes(this._tree, (node: GbTreeNode) => false);
  }

  private resetHits() {
    this.collectedUniqueNodeNames = new Set();
    this.hits = 0;
  }

  private static normalisedSearchText(text: string): string {
    return text.toLowerCase();
  }

  private registerIfMatch(normalisedSearchTerm: string): (node: GbTreeNode) => boolean {
    return (node: GbTreeNode) => {
      let match = normalisedSearchTerm
        && GbTreeSearchComponent.normalisedSearchText(node.name).includes(normalisedSearchTerm);
      if (match) {
        this.collectedUniqueNodeNames.add(node.name);
      }
      return match;
    }
  }

  private highlightTreeNodes(tree: GbTreeNode[], highlight: (node: GbTreeNode) => boolean): number {
    let nodesFound = 0;
    tree.forEach((treeNode: GbTreeNode) => {
      if (highlight(treeNode)) {
        treeNode.styleClass = 'gb-highlight-treenode';
        nodesFound += 1;
      } else {
        treeNode.styleClass = undefined;
      }
      if (treeNode.children) {
        let ancestorNodesFound = this.highlightTreeNodes(treeNode.children, highlight);
        treeNode.expanded = ancestorNodesFound > 0;
        nodesFound += ancestorNodesFound;
      }
    });
    return nodesFound;
  }

}
