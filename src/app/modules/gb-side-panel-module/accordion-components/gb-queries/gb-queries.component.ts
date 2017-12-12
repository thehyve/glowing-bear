import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {DropMode} from '../../../../models/drop-mode';
import {Query} from '../../../../models/query';
import {QueryService} from '../../../../services/query.service';

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
              private queryService: QueryService,
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

  // query panel collapse and expansion
  toggleQueryPanel(query) {
    query['collapsed'] = !query['collapsed'];
  }

  getQueryToggleButtonIcon(query) {
    return query['collapsed'] ? 'fa-angle-down' : 'fa-angle-up';
  }

  // query subscription
  toggleQuerySubscription(query) {
    query['subscribed'] = !query['subscribed'];
    const queryObject = {
      bookmarked: query['subscribed']
    };
    this.queryService.updateQuery(query['id'], queryObject);
  }

  getQuerySubscriptionButtonIcon(query) {
    return query['subscribed'] ? 'fa-rss-square' : 'fa-rss';
  }

  // query bookmark
  toggleQueryBookmark(query) {
    query['bookmarked'] = !query['bookmarked'];
    const queryObject = {
      bookmarked: query['bookmarked']
    };
    this.queryService.updateQuery(query['id'], queryObject);
  }

  getQueryBookmarkButtonIcon(query) {
    return query['bookmarked'] ? 'fa-star' : 'fa-star-o';
  }

  putQuery(selectedQuery) {
    for (let query of this.treeNodeService.queries) {
      query['selected'] = false;
    }
    selectedQuery['selected'] = true;
    this.queryService.restoreQuery(selectedQuery);
  }

  removeQuery(query) {
    this.queryService.deleteQuery(query);
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
      this.queryService.updateQuery(query['id'], queryObject);
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

  sortByName() {
    this.queries.sort((q1, q2) => {
      if (q1.name > q2.name) {
        return 1;
      } else if (q1['name'] < q2['name']) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  sortBySubscription() {
    this.queries.sort((q1, q2) => {
      if (!q1.subscribed && q2.subscribed) {
        return 1;
      } else if (q1.subscribed && !q2.subscribed) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  sortByDate() {
    this.queries.sort((q1, q2) => {
      if (q1.updateDate > q2.updateDate) {
        return 1;
      } else if (q1.updateDate < q2.updateDate) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  sortByBookmark() {
    this.queries.sort((q1, q2) => {
      if (q1.bookmarked && !q2.bookmarked) {
        return -1;
      } else if (!q1.bookmarked && q2.bookmarked) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
