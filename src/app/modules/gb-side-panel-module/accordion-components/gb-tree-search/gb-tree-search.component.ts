import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TreeNode} from 'primeng/api';

@Component({
  selector: 'gb-tree-search',
  templateUrl: './gb-tree-search.component.html',
  styleUrls: ['./gb-tree-search.component.css']
})
export class GbTreeSearchComponent {

  @Input() tree: TreeNode[];
  @Output() onClear: EventEmitter<void> = new EventEmitter<void>();
  searchTerm: string;
  collectedUniqueNodeLabels: Set<string>;
  hits: number;

  onFiltering() {
    this.resetHits();
    this.hits = this.highlightTreeNodes(this.tree, this.registerIfMatch(GbTreeSearchComponent.normalisedSearchText(this.searchTerm)));
  }

  clearFilter() {
    this.searchTerm = '';
    this.resetHits();
    this.highlightTreeNodes(this.tree, (node: TreeNode) => false);
    this.onClear.emit();
  }

  private resetHits() {
    this.collectedUniqueNodeLabels = new Set();
    this.hits = 0;
  }

  private static normalisedSearchText(text: string): string {
    return text.toLowerCase();
  }

  private registerIfMatch(normalisedSearchTerm: string): (node: TreeNode) => boolean {
    return (node: TreeNode) => {
      let match = normalisedSearchTerm
        && GbTreeSearchComponent.normalisedSearchText(node.label).includes(normalisedSearchTerm);
      if (match) {
        this.collectedUniqueNodeLabels.add(node.label);
      }
      return match;
    }
  }

  private highlightTreeNodes(tree: TreeNode[], highlight: (node: TreeNode) => boolean): number {
    let nodesFound = 0;
    tree.forEach((treeNode: TreeNode) => {
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
