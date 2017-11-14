import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {DropMode} from '../../../../models/drop-mode';
import {Query} from '../../../../models/query';

@Component({
  selector: 'gb-queries',
  templateUrl: './gb-queries.component.html',
  styleUrls: ['./gb-queries.component.css']
})
export class GbQueriesComponent implements OnInit, AfterViewInit {

  searchTerm = '';
  observer: MutationObserver;
  collapsed = false;

  constructor(public treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
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

  update() {
    let panels = this.element.nativeElement.querySelectorAll('.gb-query-panel');
    let index = 0;
    for (let panel of panels) {
      let correspondingQuery = this.treeNodeService.queries[index];
      panel.addEventListener('dragstart', (function () {
        correspondingQuery['dropMode'] = DropMode.Query;
        this.constraintService.selectedNode = correspondingQuery;
      }).bind(this));
      index++;
    }
  }

  toggleQueryPanel(query) {
    query['collapsed'] = !query['collapsed'];
  }

  getQueryToggleButtonIcon(query) {
    return query['collapsed'] ? 'fa-angle-down' : 'fa-angle-up';
  }

  toggleQueryBookmark(query) {
    query['bookmarked'] = !query['bookmarked'];
    const queryObject = {
      bookmarked: query['bookmarked']
    };
    this.constraintService.updateQuery(query['id'], queryObject);
  }

  getQueryBookmarkButtonIcon(query) {
    return query['bookmarked'] ? 'fa-star' : 'fa-star-o';
  }

  putQuery(selectedQuery) {
    for (let query of this.treeNodeService.queries) {
      query['selected'] = false;
    }
    selectedQuery['selected'] = true;
    this.constraintService.putQuery(selectedQuery);
  }

  getQuerySelectionButtonIcon(query) {
    return query['selected'] ? 'fa-arrow-circle-right' : 'fa-arrow-right';
  }

  removeQuery(query) {
    this.constraintService.deleteQuery(query);
  }

  downloadQuery(query) {
    let data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(query));
    let el = document.createElement('a');
    el.setAttribute('href', data);
    el.setAttribute('download', query.name + '.json');
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }

  editQueryName(event, query) {
    event.preventDefault();
    event.stopPropagation();
    query['nameEditable'] = true;
  }

  onQueryPanelClick(query) {
    // Save the query if its name has been modified
    if (query['nameEditable']) {
      query['nameEditable'] = false;
      const queryObject = {
        name: query['name']
      };
      this.constraintService.updateQuery(query['id'], queryObject);
    }
  }

  onFiltering(event) {
    let filterWord = this.searchTerm.trim().toLowerCase();
    for (let query of this.treeNodeService.queries) {
      if (query.name.indexOf(filterWord) === -1) {
        query['visible'] = false;
      } else {
        query['visible'] = true;
      }
    }
    this.removeFalsePrimeNgClasses(500);
  }

  clearFilter() {
    this.searchTerm = '';
    for (let query of this.treeNodeService.queries) {
      query['visible'] = true;
    }
    this.removeFalsePrimeNgClasses(500);
  }

  removeFalsePrimeNgClasses(delay: number) {
    window.setTimeout((function () {
      let loaderIcon = this.element.nativeElement.querySelector('.ui-autocomplete-loader');
      if (loaderIcon) {
        loaderIcon.remove();
      }
    }).bind(this), delay);
  }

  get queries(): Query[] {
    return this.treeNodeService.queries;
  }

}
