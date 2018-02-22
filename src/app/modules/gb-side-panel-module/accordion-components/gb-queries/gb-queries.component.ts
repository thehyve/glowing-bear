import {Component, OnInit, ElementRef} from '@angular/core';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {Query} from '../../../../models/query';
import {QueryService} from '../../../../services/query.service';
import {DownloadHelper} from '../../../../utilities/DownloadHelper';
import {ConfirmationService} from "primeng/primeng";

@Component({
  selector: 'gb-queries',
  templateUrl: './gb-queries.component.html',
  styleUrls: ['./gb-queries.component.css']
})
export class GbQueriesComponent implements OnInit {

  searchTerm = '';
  private isUploadListenerNotAdded: boolean;

  constructor(public treeNodeService: TreeNodeService,
              private queryService: QueryService,
              private element: ElementRef,
              private confirmationService: ConfirmationService) {
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

  processSubjectIdsUpload(fileContents: string, fileName: string): Query {
    // we assume the text contains a list of subject Ids
    let subjectIds: string[] = fileContents.split(/(\r?\n)+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
    let query = new Query(null, fileName);
    query.patientsQuery = {
      'type': 'patient_set',
      'subjectIds': subjectIds
    };
    query.observationsQuery = {data: null};
    return query;
  }

  queryFileUpload(event) {
    let reader = new FileReader();
    let file: File = event.target.files[0];
    reader.onload = (function (e: Event) {
      let contents: string = e.target['result'] as string;
      if (file.type === 'application/json') {
        let _json = JSON.parse(contents);
        let pathArray = null;
        // If the json is of standard format
        if (_json['patientsQuery'] || _json['observationsQuery']) {
          this.queryService.restoreQuery(_json);
        } else if (_json['names']) {
          pathArray = [];
          this.treeNodeService.convertItemsToPaths(this.treeNodeService.treeNodes, _json['names'], pathArray);
        } else if (_json['paths']) {
          pathArray = _json['paths'];
        } else if (_json.constructor === Array) {
          pathArray = _json;
        }
        if (pathArray) {
          let query = new Query(null, file.name);
          query.observationsQuery = {
              data: pathArray
          };
          this.queryService.restoreQuery(query);
        }
      } else if (file.type === 'text/plain' ||
        file.type === 'text/tab-separated-values' ||
        file.type === 'text/csv' ||
        file.type === '') {
        let query = this.processSubjectIdsUpload(contents, file.name);
        this.queryService.restoreQuery(query);
      }

      // reset the input path so that it will take the same file again
      document.getElementById('queryFileUpload')['value'] = '';
    }).bind(this);
    reader.readAsText(file);
  }

  // query subscription
  toggleQuerySubscription(event: Event, query: Query) {
    event.stopPropagation();
    query.subscribed = !query.subscribed;
    const queryObject = {
      bookmarked: query.subscribed
    };
    this.queryService.updateQuery(query.id, queryObject);
  }

  getQuerySubscriptionButtonIcon(query: Query) {
    return query.subscribed ? 'fa-rss-square' : 'fa-rss';
  }

  // query bookmark
  toggleQueryBookmark(event: Event, query: Query) {
    event.stopPropagation();
    query.bookmarked = !query.bookmarked;
    const queryObject = {
      bookmarked: query.bookmarked
    };
    this.queryService.updateQuery(query.id, queryObject);
  }

  getQueryBookmarkButtonIcon(query: Query) {
    return query.bookmarked ? 'fa-star' : 'fa-star-o';
  }

  restoreQuery(event: Event, selectedQuery: Query) {
    event.stopPropagation();
    for (let query of this.queryService.queries) {
      query.selected = false;
    }
    selectedQuery.selected = true;
    this.queryService.restoreQuery(selectedQuery);
  }

  removeQuery(event: Event, query: Query) {
    event.stopPropagation();
    this.queryService.deleteQuery(query);
  }

  confirmRemoval(event: Event, query: Query) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove the query?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeQuery(event, query);
      },
      reject: () => {
      }
    });
  }

  downloadQuery(event: Event, query: Query) {
    event.stopPropagation();
    DownloadHelper.downloadJSON(query, query.name);
  }

  onFiltering(event) {
    let filterWord = this.searchTerm.trim().toLowerCase();
    for (let query of this.queryService.queries) {
      if (query.name.indexOf(filterWord) === -1) {
        query.visible = false;
      } else {
        query.visible = true;
      }
    }
    this.removeFalsePrimeNgClasses(500);
  }

  clearFilter() {
    this.searchTerm = '';
    for (let query of this.queryService.queries) {
      query.visible = true;
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
