/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbQueriesComponent} from './gb-queries.component';
import {
  AutoCompleteModule,
  ButtonModule,
  ConfirmationService,
  ConfirmDialogModule,
  DataListModule,
  DragDropModule,
  InputTextModule,
  PanelModule,
  RadioButtonModule,
  TooltipModule
} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {FormsModule} from '@angular/forms';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {Md2AccordionModule} from 'md2';
import {MessageHelper} from '../../../../utilities/message-helper';
import {log} from 'util';
import {type} from 'os';
import {get} from 'selenium-webdriver/http';
import {Query} from '../../../../models/query-models/query';
import {QueryDiffRecord} from '../../../../models/query-models/query-diff-record';
import {DownloadHelper} from '../../../../utilities/download-helper';
import {ConstraintHelper} from '../../../../utilities/constraint-utilities/constraint-helper';
import {UIHelper} from '../../../../utilities/ui-helper';

describe('QueriesComponent', () => {
  let component: GbQueriesComponent;
  let fixture: ComponentFixture<GbQueriesComponent>;
  let queryService: QueryService;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbQueriesComponent],
      imports: [
        BrowserAnimationsModule,
        DataListModule,
        DragDropModule,
        PanelModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
        FormsModule,
        AutoCompleteModule,
        ConfirmDialogModule,
        Md2AccordionModule,
        RadioButtonModule
      ],
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        ConfirmationService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    queryService = TestBed.get(QueryService);
    confirmationService = TestBed.get(ConfirmationService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should simulate click when importing query', () => {
    let id = 'queryFileUpload';
    let uploadElm = document.getElementById(id);
    let spy1 = spyOn(document, 'getElementById').and.callThrough();
    let spy2 = spyOn(uploadElm, 'click').and.stub();
    component.importQuery();
    expect(spy1).toHaveBeenCalledWith(id);
    expect(uploadElm['value']).toEqual('');
    expect(spy2).toHaveBeenCalled();
  })

  it('should add event listener if needed when importing a query', () => {
    let id = 'queryFileUpload';
    let uploadElm = document.getElementById(id);
    component.isUploadListenerNotAdded = true;
    let spy1 = spyOn(uploadElm, 'addEventListener').and.stub();
    component.importQuery();
    expect(spy1).toHaveBeenCalled();
    expect(component.isUploadListenerNotAdded).toBe(false);
  })

  it('should not add event listener when there is one when importing a query', () => {
    let id = 'queryFileUpload';
    let uploadElm = document.getElementById(id);
    let spy1 = spyOn(uploadElm, 'addEventListener').and.stub();
    component.isUploadListenerNotAdded = false;
    component.importQuery();
    expect(spy1).not.toHaveBeenCalled();
  })

  it('should read uploaded query file', async () => {
    fixture.detectChanges();
    let file = new File([], 'testFile');
    let event = {
      target: {
        files: [file]
      }
    };
    let spy1 = spyOn(MessageHelper, 'alert').and.stub();
    let spy2 = spyOn(queryService, 'saveQueryByObject').and.stub();
    let spy3 = spyOn(component, 'verifyFile').and.stub();

    component.queryFileUpload(event);
    fixture.whenStable().then(() => {
      FileReader.prototype.onload.bind(component);
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled();
    })
  })

  it('should parse uploaded query file if file type is json', () => {
    let file = new File([], 'testFile.txt');
    let data = {};
    let spy0 = spyOnProperty(file, 'type', 'get').and.returnValue('application/json');
    let spy1 = spyOn(JSON, 'parse').and.callFake(() => {
      return {};
    });
    let result = component.verifyFile(file, data);
    expect(spy0).toHaveBeenCalled();
    expect(spy1).toHaveBeenCalled();
  })

  it('should parse uploaded query file if file tail is json', () => {
    let file = new File([], 'testFile.json');
    let data = {};
    let json = {
      subjectQuery: {},
      observationQuery: {}
    };
    let spy0 = spyOnProperty(file, 'type', 'get').and.returnValue('wrong-type');
    let spy1 = spyOn(JSON, 'parse').and.callFake(() => {
      return json;
    })
    let result = component.verifyFile(file, data);
    expect(spy0).toHaveBeenCalled();
    expect(spy1).toHaveBeenCalled();
    expect(result).toBe(json);
  })

  it('should not parse file when file is not json or is not up to standard', () => {
    let file = new File([], 'testFile.txt');
    let data = {};
    let json = {};
    let spy0 = spyOnProperty(file, 'type', 'get').and.returnValue('wrong-type');
    let spy1 = spyOn(JSON, 'parse').and.callFake(() => {
      return json;
    });
    let spy2 = spyOn(MessageHelper, 'alert').and.stub();
    let result = component.verifyFile(file, data);
    expect(spy0).toHaveBeenCalled();
    expect(spy1).not.toHaveBeenCalled();
    expect(result).not.toBe(json);
    expect(spy2).toHaveBeenCalled();
  })

  it('should toggle query subscription', () => {
    let e = new Event('');
    let query = new Query('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(queryService, 'toggleQuerySubscription').and.stub();
    component.toggleQuerySubscription(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  })

  it('should get query subscription button icon', () => {
    let query = new Query('id', 'name');
    query.subscribed = true;
    let icon = component.getQuerySubscriptionButtonIcon(query);
    expect(icon).toEqual('fa-rss-square');
    query.subscribed = false;
    icon = component.getQuerySubscriptionButtonIcon(query);
    expect(icon).toEqual('fa-rss');
  })

  it('should get toggle query bookmark', () => {
    let e = new Event('');
    let query = new Query('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(queryService, 'toggleQueryBookmark').and.stub();
    component.toggleQueryBookmark(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  })

  it('should get query bookmark button icon', () => {
    let query = new Query('id', 'name');
    query.bookmarked = true;
    let icon = component.getQueryBookmarkButtonIcon(query);
    expect(icon).toEqual('fa-star');
    query.bookmarked = false;
    icon = component.getQueryBookmarkButtonIcon(query);
    expect(icon).toEqual('fa-star-o');
  })

  it('should restore query', () => {
    let e = new Event('');
    let query = new Query('id', 'name');
    let query1 = new Query('id1', 'name1');
    queryService.queries = [query, query1];
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(queryService, 'restoreQuery').and.stub();
    component.restoreQuery(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(query.selected).toBe(true);
    expect(query1.selected).toBe(false);
    expect(spy2).toHaveBeenCalled();
  })

  it('should toggle query subscription panel', () => {
    let query = new Query('id', 'name');
    query.subscriptionCollapsed = true;
    component.toggleSubscriptionPanel(query);
    expect(query.subscriptionCollapsed).toBe(false);
  })

  it('should toggle query subscription record panel', () => {
    let record = new QueryDiffRecord();
    record.showCompleteRepresentation = true;
    component.toggleSubscriptionRecordPanel(record);
    expect(record.showCompleteRepresentation).toBe(false);
  })

  it('should remove query', () => {
    let e = new Event('');
    let query = new Query('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(queryService, 'deleteQuery').and.stub();
    component.removeQuery(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  })

  it('should confirm the removal of a query', () => {
    let e = new Event('');
    let query = new Query('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(confirmationService, 'confirm').and.callFake((params) => {
      params.accept();
    });
    let spy3 = spyOn(component, 'removeQuery').and.stub();
    component.confirmRemoval(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  })

  it('should handle query removal error', () => {
    let e = new Event('');
    let query = new Query('id', 'name');
    let spy1 = spyOn(MessageHelper, 'alert').and.stub();
    let spy2 = spyOn(confirmationService, 'confirm').and.callFake((params) => {
      params.reject();
    });
    component.confirmRemoval(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  })

  it('should download query', () => {
    let e = new Event('');
    let query = new Query('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(DownloadHelper, 'downloadJSON').and.stub();
    let spy3 = spyOn(ConstraintHelper, 'mapQueryToObject').and.stub();
    component.downloadQuery(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  })

  it('check subscription frequency radio button', () => {
    let spy1 = spyOn(queryService, 'updateQuery').and.stub();
    component.radioCheckSubscriptionFrequency(new Query('id', 'name'));
    expect(spy1).toHaveBeenCalled();
  })

  it('download subscription record', () => {
    let spy1 = spyOn(DownloadHelper, 'downloadJSON').and.stub();
    let query = new Query('id', 'name');
    let record = new QueryDiffRecord();
    record.completeRepresentation = 'test-complete';
    record.createDate = 'test-create-date';
    component.downloadSubscriptionRecord(query, record);
    expect(spy1).toHaveBeenCalled();
  })

  it('should handle filering of queries', () => {
    let e = new Event('');
    let query = new Query('id', 'name111');
    let spy = spyOn(UIHelper, 'removePrimeNgLoaderIcon').and.stub();
    queryService.queries = [query];
    component.searchTerm = 'tesT-search term ';
    component.onFiltering(e);
    expect(query.visible).toBe(false);

    component.searchTerm = '11  ';
    component.onFiltering(e);
    expect(query.visible).toBe(true);
    expect(spy).toHaveBeenCalled();
  })

  it('should clear filter and restore query visibility', () => {
    component.searchTerm = 'test';
    let query = new Query('id', 'name111');
    let spy = spyOn(UIHelper, 'removePrimeNgLoaderIcon').and.stub();
    query.visible = false;
    queryService.queries = [query];
    component.clearFilter();
    expect(component.searchTerm).toBe('');
    expect(query.visible).toBe(true);
    expect(spy).toHaveBeenCalled();
  })

  it('should sort correctly', () => {
    let q1 = new Query('id1', 'name1');
    q1.subscribed = true;
    q1.bookmarked = true;
    q1.updateDate = '2018';
    let q1_1 = new Query('id1-1', 'name1');
    q1_1.subscribed = false;
    q1_1.bookmarked = true;
    q1_1.updateDate = '2018';
    let q2 = new Query('id2', 'name2');
    q2.subscribed = false;
    q2.bookmarked = false;
    q2.updateDate = '2019';
    let q3 = new Query('id3', 'name3');
    q3.subscribed = true;
    q3.bookmarked = true;
    q3.updateDate = '2020';
    queryService.queries = [q2, q3, q1, q1_1];
    component.sortByName();
    expect(component.queries[0]).toBe(q1);
    expect(component.queries[1]).toBe(q1_1);
    expect(component.queries[2]).toBe(q2);
    expect(component.queries[3]).toBe(q3);

    component.sortBySubscription();
    expect(component.queries[0]).toBe(q1);
    expect(component.queries[1]).toBe(q3);

    component.sortByDate();
    expect(component.queries[0]).toBe(q1);
    expect(component.queries[1]).toBe(q1_1);

    component.sortByBookmark();
    expect(component.queries[0]).toBe(q1);
    expect(component.queries[1]).toBe(q1_1);
    expect(component.queries[2]).toBe(q3);
    expect(component.queries[3]).toBe(q2);
  })

});
