import {Component, OnInit, ElementRef} from '@angular/core';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {Query} from '../../../../models/query';
import {QueryService} from '../../../../services/query.service';

@Component({
  selector: 'gb-queries',
  templateUrl: './gb-queries.component.html',
  styleUrls: ['./gb-queries.component.css']
})
export class GbQueriesComponent implements OnInit {

  searchTerm = '';
  collapsed = false;
  private isUploadListenerNotAdded: boolean;

  constructor(public treeNodeService: TreeNodeService,
              private queryService: QueryService,
              private element: ElementRef) {
    this.isUploadListenerNotAdded = true;
  }

  ngOnInit() {
  }

  importQuery() {
    let uploadElm = document.getElementById('queryFileUpload');
    if (this.isUploadListenerNotAdded) {
      uploadElm
        .addEventListener('change', this.queryFileUpload.bind(this), false);
      this.isUploadListenerNotAdded = false;
    }
    uploadElm.click();
  }

  queryFileUpload(event) {
    let reader = new FileReader();
    let file = event.target.files[0];
    reader.onload = (function (e) {
      if (file.type === 'application/json') {
        let json = JSON.parse(e.target['result']);
        let pathArray = null;
        // If the json is of standard format
        if (json['patientsQuery'] || json['observationsQuery']) {
          this.queryService.restoreQuery(json);
        } else if (json['paths']) {
          pathArray = json['paths'];
        } else if (json.constructor === Array) {
          pathArray = json;
        }
        if (pathArray) {
          let query = {
            'name': 'imported temporary query',
            'observationsQuery': {
              data: pathArray
            }
          };
          this.queryService.restoreQuery(query);
          this.queryService.alert('Imported concept selection in Step 2.', '', 'info');
        }
      } else if (file.type === 'text/plain' ||
        file.type === 'text/tab-separated-values' ||
        file.type === 'text/csv' ||
        file.type === '') {
        // we assume the text contains a list of subject Ids
        let query = {
          'name': 'imported temporary query',
          'patientsQuery': {
            'type': 'patient_set',
            'subjectIds': e.target['result'].split('\n')
          },
          'observationsQuery': {}
        };
        this.queryService.restoreQuery(query);
        this.queryService.alert('Imported subject selection in Step 1.', '', 'info');
      }

      // reset the input path so that it will take the same file again
      document.getElementById('queryFileUpload')['value'] = '';
    }).bind(this);
    reader.readAsText(file);
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
    for (let query of this.queryService.queries) {
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

  onQueryPanelKeyEnter(event, query) {
    if (event.key === 'Enter' && query['nameEditable']) {
      query['nameEditable'] = false;
      const queryObject = {
        name: query['name']
      };
      this.queryService.updateQuery(query['id'], queryObject);
    }
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
    for (let query of this.queryService.queries) {
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
    for (let query of this.queryService.queries) {
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
    return this.queryService.queries;
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
