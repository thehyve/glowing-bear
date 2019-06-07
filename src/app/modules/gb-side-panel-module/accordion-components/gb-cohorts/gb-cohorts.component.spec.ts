/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbCohortsComponent} from './gb-cohorts.component';
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
  ToggleButtonModule,
  TooltipModule
} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {CohortService} from '../../../../services/cohort.service';
import {CohortServiceMock} from '../../../../services/mocks/cohort.service.mock';
import {Md2AccordionModule} from 'md2';
import {MessageHelper} from '../../../../utilities/message-helper';
import {Cohort} from '../../../../models/cohort-models/cohort';
import {CohortDiffRecord} from '../../../../models/cohort-models/cohort-diff-record';
import {DownloadHelper} from '../../../../utilities/download-helper';
import {UIHelper} from '../../../../utilities/ui-helper';
import {FileImportHelper} from '../../../../utilities/file-import-helper';
import {CountService} from '../../../../services/count.service';
import {CountServiceMock} from '../../../../services/mocks/count.service.mock';
import {CohortMapper} from '../../../../utilities/cohort-utilities/cohort-mapper';

describe('GbCohortsComponent', () => {
  let component: GbCohortsComponent;
  let fixture: ComponentFixture<GbCohortsComponent>;
  let cohortService: CohortService;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbCohortsComponent],
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
        RadioButtonModule,
        ToggleButtonModule
      ],
      providers: [
        {
          provide: CohortService,
          useClass: CohortServiceMock
        },
        {
          provide: CountService,
          useClass: CountServiceMock
        },
        ConfirmationService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCohortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    cohortService = TestBed.get(CohortService);
    confirmationService = TestBed.get(ConfirmationService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should simulate click when importing cohort', () => {
    let id = 'cohortFileUpload';
    let uploadElm = document.getElementById(id);
    let spy1 = spyOn(document, 'getElementById').and.callThrough();
    let spy2 = spyOn(uploadElm, 'click').and.stub();
    component.importCohort();
    expect(spy1).toHaveBeenCalledWith(id);
    expect(uploadElm['value']).toEqual('');
    expect(spy2).toHaveBeenCalled();
  });

  it('should add event listener if needed when importing a cohort', () => {
    let id = 'cohortFileUpload';
    let uploadElm = document.getElementById(id);
    component.isUploadListenerNotAdded = true;
    let spy1 = spyOn(uploadElm, 'addEventListener').and.stub();
    component.importCohort();
    expect(spy1).toHaveBeenCalled();
    expect(component.isUploadListenerNotAdded).toBe(false);
  });

  it('should not add event listener when there is one when importing a cohort', () => {
    let id = 'cohortFileUpload';
    let uploadElm = document.getElementById(id);
    let spy1 = spyOn(uploadElm, 'addEventListener').and.stub();
    component.isUploadListenerNotAdded = false;
    component.importCohort();
    expect(spy1).not.toHaveBeenCalled();
  });

  it('should have cohort import with subject id file', () => {
    const e = {
      target: {
        result: 'foobar'
      }
    };
    const fileTxt = new File(
      ['id1\nid2'],
      'subjectIds.txt',
      {type: 'text/plain'});

    const spyFileImporter = spyOn(FileImportHelper, 'getFile').and.returnValue(fileTxt);
    const spyCohortRestore = spyOn(cohortService, 'restoreCohort').and.stub();
    const spyMessage = spyOn(MessageHelper, 'alert').and.stub();
    component.handleCohortImport(e);
    expect(spyFileImporter).toHaveBeenCalled();
    expect(spyCohortRestore).toHaveBeenCalled();
    expect(spyMessage).toHaveBeenCalledTimes(1);
  });

  it('should have cohort import with cohort json file', () => {
    const e = {
      target: {
        result: '{"queryConstraint":"sth"}'
      }
    };
    const fileJson = new File(
      [],
      'cohort.json',
      {type: 'application/json'});

    const spyFileImporter = spyOn(FileImportHelper, 'getFile').and.returnValue(fileJson);
    const spyTMmapper = spyOn(CohortMapper, 'deserialise').and.stub();
    const spyCohortRestore = spyOn(cohortService, 'restoreCohort').and.stub();
    const spyMessage = spyOn(MessageHelper, 'alert').and.stub();
    component.handleCohortImport(e);
    expect(spyFileImporter).toHaveBeenCalled();
    expect(spyTMmapper).toHaveBeenCalled();
    expect(spyCohortRestore).toHaveBeenCalled();
    expect(spyMessage).toHaveBeenCalledTimes(1);
  });

  it('should have cohort import with invalid file', () => {
    const e = {
      target: {
        result: 'sth'
      }
    };
    const file = new File(
      [],
      'cohort.xml',
      {type: 'application/xml'});

    const spyFileImporter = spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    const spyMessage = spyOn(MessageHelper, 'alert').and.stub();
    component.handleCohortImport(e);
    expect(spyFileImporter).toHaveBeenCalled();
    expect(spyMessage).toHaveBeenCalledTimes(2);
  });

  it('should read uploaded cohort file', () => {
    fixture.detectChanges();
    const contents = '{"queryConstraint": {"type": "true"}, "id": "test", "name": "test cohort"}';
    const file = new File([contents], 'testFile', {type: 'application/json'});
    let event = {
      target: {
        files: [file],
        result: contents
      }
    };
    spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    let spy1 = spyOn(MessageHelper, 'alert').and.stub();
    let spy2 = spyOn(cohortService, 'restoreCohort').and.stub();
    let spy3 = spyOn(CohortMapper, 'deserialise').and.callThrough();

    component.handleCohortImport(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('should parse uploaded cohort file if file type is json', () => {
    const contents = '{}';
    const file = new File([contents], 'testFile.txt', {type: 'application/json'});
    spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    const event = {
      target: {
        files: [file],
        result: contents
      }
    };
    let spy1 = spyOn(JSON, 'parse').and.callFake(() => {
      return {};
    });
    component.handleCohortImport(event);
    expect(spy1).toHaveBeenCalled();
  });

  it('should process uploaded subject ids', () => {
    let fileContents = 'id123\nid456\n';
    let file = new File([fileContents], 'testName', {type: 'text/plain'});
    spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    let event = {
      target: {
        files: [file],
        result: fileContents
      }
    };
    let spy = spyOn(cohortService, 'restoreCohort').and.stub();

    component.handleCohortImport(event);
    expect(spy).toHaveBeenCalledWith(jasmine.any(Cohort));
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({name: 'testName'}));
  });

  it('should trigger click when importing file', () => {
    let uploadElm = document.createElement('a');
    spyOn(document, 'getElementById').and.returnValue(uploadElm);
    let spy1 = spyOn(uploadElm, 'click').and.callThrough();
    component['isUploadListenerNotAdded'] = true;
    component.importCohort();
    expect(component['isUploadListenerNotAdded']).toBe(false);
    expect(spy1).toHaveBeenCalled();
  });

  it('should toggle cohort subscription', () => {
    let e = new Event('');
    let cohort = new Cohort('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(cohortService, 'toggleCohortSubscription').and.stub();
    component.toggleSubscription(e, cohort);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should get cohort subscription button icon', () => {
    let cohort = new Cohort('id', 'name');
    cohort.subscribed = true;
    let icon = component.getSubscriptionButtonIcon(cohort);
    expect(icon).toEqual('fa fa-rss-square');
    cohort.subscribed = false;
    icon = component.getSubscriptionButtonIcon(cohort);
    expect(icon).toEqual('fa fa-rss');
  });

  it('should get toggle cohort bookmark', () => {
    let e = new Event('');
    let target = new Cohort('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(cohortService, 'toggleCohortBookmark').and.stub();
    component.toggleBookmark(e, target);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should get cohort bookmark button icon', () => {
    let target = new Cohort('id', 'name');
    target.bookmarked = true;
    let icon = component.getBookmarkButtonIcon(target);
    expect(icon).toEqual('fa fa-star');
    target.bookmarked = false;
    icon = component.getBookmarkButtonIcon(target);
    expect(icon).toEqual('fa fa-star-o');
  });

  it('should restore cohort', () => {
    let e = new Event('');
    let target = new Cohort('id', 'name');
    let target1 = new Cohort('id1', 'name1');
    cohortService.cohorts = [target, target1];
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(cohortService, 'restoreCohort').and.stub();
    component.restoreCohort(e, target);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should toggle cohort subscription panel', () => {
    let target = new Cohort('id', 'name');
    target.subscriptionCollapsed = true;
    component.toggleSubscriptionPanel(target);
    expect(target.subscriptionCollapsed).toBe(false);
  });

  it('should toggle cohort subscription record panel', () => {
    let record = new CohortDiffRecord();
    record.showCompleteRepresentation = true;
    component.toggleSubscriptionRecordPanel(record);
    expect(record.showCompleteRepresentation).toBe(false);
  });

  it('should remove cohort', () => {
    let e = new Event('');
    let target = new Cohort('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(cohortService, 'deleteCohort').and.stub();
    component.removeCohort(e, target);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should confirm the removal of a cohort', () => {
    let e = new Event('');
    let target = new Cohort('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(confirmationService, 'confirm').and.callFake((params) => {
      params.accept();
    });
    let spy3 = spyOn(component, 'removeCohort').and.stub();
    component.confirmRemoval(e, target);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('should handle cohort removal error', () => {
    let e = new Event('');
    let query = new Cohort('id', 'name');
    let spy1 = spyOn(MessageHelper, 'alert').and.stub();
    let spy2 = spyOn(confirmationService, 'confirm').and.callFake((params) => {
      params.reject();
    });
    component.confirmRemoval(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should download cohort', () => {
    let e = new Event('');
    let query = new Cohort('id', 'name');
    let spy1 = spyOn(e, 'stopPropagation').and.stub();
    let spy2 = spyOn(DownloadHelper, 'downloadJSON').and.stub();
    let spy3 = spyOn(CohortMapper, 'serialise').and.stub();
    component.downloadCohort(e, query);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('check subscription frequency radio button', () => {
    let spy1 = spyOn(cohortService, 'editCohort').and.stub();
    component.radioCheckSubscriptionFrequency(new MouseEvent(''), new Cohort('id', 'name'));
    expect(spy1).toHaveBeenCalled();
  });

  it('download subscription record', () => {
    let spy1 = spyOn(DownloadHelper, 'downloadJSON').and.stub();
    let query = new Cohort('id', 'name');
    let record = new CohortDiffRecord();
    record.completeRepresentation = 'test-complete';
    record.createDate = 'test-create-date';
    component.downloadSubscriptionRecord(query, record);
    expect(spy1).toHaveBeenCalled();
  });

  it('should handle filtering of cohorts', () => {
    let e = new Event('');
    let target = new Cohort('id', 'name111');
    let spy = spyOn(UIHelper, 'removePrimeNgLoaderIcon').and.stub();
    cohortService.cohorts = [target];
    component.searchTerm = 'tesT-search term ';
    component.onFiltering(e);
    expect(target.visible).toBe(false);

    component.searchTerm = '11  ';
    component.onFiltering(e);
    expect(target.visible).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should clear filter and restore cohort visibility', () => {
    component.searchTerm = 'test';
    let query = new Cohort('id', 'name111');
    let spy = spyOn(UIHelper, 'removePrimeNgLoaderIcon').and.stub();
    query.visible = false;
    cohortService.cohorts = [query];
    component.clearFilter();
    expect(component.searchTerm).toBe('');
    expect(query.visible).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should sort correctly', () => {
    let q1 = new Cohort('id1', 'name1');
    q1.subscribed = true;
    q1.bookmarked = true;
    q1.updateDate = '2018';
    let q1_1 = new Cohort('id1-1', 'name1');
    q1_1.subscribed = false;
    q1_1.bookmarked = true;
    q1_1.updateDate = '2018';
    let q2 = new Cohort('id2', 'name2');
    q2.subscribed = false;
    q2.bookmarked = false;
    q2.updateDate = '2019';
    let q3 = new Cohort('id3', 'name3');
    q3.subscribed = true;
    q3.bookmarked = true;
    q3.updateDate = '2020';
    cohortService.cohorts = [q2, q3, q1, q1_1];
    component.sortByName();
    expect(component.cohorts[0]).toBe(q1);
    expect(component.cohorts[1]).toBe(q1_1);
    expect(component.cohorts[2]).toBe(q2);
    expect(component.cohorts[3]).toBe(q3);

    component.sortBySubscription();
    expect(component.cohorts[0]).toBe(q1);
    expect(component.cohorts[1]).toBe(q3);

    component.sortByDate();
    expect(component.cohorts[0]).toBe(q1);
    expect(component.cohorts[1]).toBe(q1_1);

    component.sortByBookmark();
    expect(component.cohorts[0]).toBe(q1);
    expect(component.cohorts[1]).toBe(q1_1);
    expect(component.cohorts[2]).toBe(q3);
    expect(component.cohorts[3]).toBe(q2);
  });
});
