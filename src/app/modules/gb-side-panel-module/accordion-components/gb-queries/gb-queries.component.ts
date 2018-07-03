import {Component, OnInit, ElementRef} from '@angular/core';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {Query} from '../../../../models/query-models/query';
import {QueryService} from '../../../../services/query.service';
import {QueryDiffRecord} from '../../../../models/query-models/query-diff-record';
import {DownloadHelper} from '../../../../utilities/download-helper';
import {ConfirmationService} from 'primeng/primeng';
import {UIHelper} from '../../../../utilities/ui-helper';
import {ConstraintHelper} from '../../../../utilities/constraint-utilities/constraint-helper';
import {MessageHelper} from '../../../../utilities/message-helper';

@Component({
  selector: 'gb-queries',
  templateUrl: './gb-queries.component.html',
  styleUrls: ['./gb-queries.component.css']
})
export class GbQueriesComponent implements OnInit {

  searchTerm = '';
  isUploadListenerNotAdded: boolean;
  file: File; // holds the uploaded query file

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
    // reset the input path so that it will take the same file again
    uploadElm['value'] = '';
    uploadElm.click();
  }

  queryFileUpload(event) {
    MessageHelper.alert('info', 'Query file is being processed, waiting for response.');
    let reader = new FileReader();
    this.file = event.target.files[0];
    reader.onload = this.handleQueryFileUploadEvent.bind(this);
    reader.readAsText(this.file);
  }

  handleQueryFileUploadEvent(e) {
    let data = e.target['result'];
    let queryObj = this.verifyFile(this.file, data);
    this.queryService.saveQueryByObject(queryObj);
  }

  // verify the uploaded query file
  verifyFile(file: File, data: any) {
    // file.type is empty for some browsers and Windows OS
    if (file.type === 'application/json' || file.name.split('.').pop() === 'json') {
      let _json = JSON.parse(data);
      // If the json is of standard format
      if (_json['subjectQuery'] || _json['observationQuery']) {
        return _json;
      } else {
        MessageHelper.alert('error', 'Invalid file content for query import.');
        return;
      }
    } else {
      MessageHelper.alert('error', 'Invalid file content for query import.');
      return;
    }
  }

  // query subscription
  toggleQuerySubscription(event: Event, query: Query) {
    event.stopPropagation();
    this.queryService.toggleQuerySubscription(query);
  }

  getQuerySubscriptionButtonIcon(query: Query) {
    return query.subscribed ? 'fa-rss-square' : 'fa-rss';
  }

  // query bookmark
  toggleQueryBookmark(event: Event, query: Query) {
    event.stopPropagation();
    this.queryService.toggleQueryBookmark(query);
  }

  getQueryBookmarkButtonIcon(query: Query) {
    return query.bookmarked ? 'fa-star' : 'fa-star-o';
  }

  restoreQuery(event: Event, selectedQuery: Query) {
    event.stopPropagation();
    for (let query of this.queryService.queries) {
      query.selected = false;
    }
    selectedQuery.selected = true; console.log('restore query: ', selectedQuery)
    this.queryService.restoreQuery(selectedQuery);
  }

  toggleSubscriptionPanel(query: Query) {
    query.subscriptionCollapsed = !query.subscriptionCollapsed;
  }

  toggleSubscriptionRecordPanel(record: QueryDiffRecord) {
    record.showCompleteRepresentation = !record.showCompleteRepresentation;
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
        MessageHelper.alert('error', `Cannot remove the query ${query.name}`);
      }
    });
  }

  downloadQuery(event: Event, query: Query) {
    event.stopPropagation();
    DownloadHelper.downloadJSON(ConstraintHelper.mapQueryToObject(query), query.name);
  }

  radioCheckSubscriptionFrequency(query: Query) {
    let queryObj = {
      subscriptionFreq: query.subscriptionFreq
    };
    this.queryService.updateQuery(query, queryObj);
  }

  downloadSubscriptionRecord(query: Query, record: QueryDiffRecord) {
    const filename = query.name + '-record-' + record.createDate;
    DownloadHelper.downloadJSON(record.completeRepresentation, filename);
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
    UIHelper.removePrimeNgLoaderIcon(this.element, 500);
  }

  clearFilter() {
    this.searchTerm = '';
    for (let query of this.queryService.queries) {
      query.visible = true;
    }
    UIHelper.removePrimeNgLoaderIcon(this.element, 500);
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
