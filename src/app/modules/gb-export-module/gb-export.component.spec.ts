/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbExportComponent} from './gb-export.component';
import {
  AutoCompleteModule, CheckboxModule, DataListModule, DataTableModule, DropdownModule, FieldsetModule, MessagesModule,
  PanelModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock, AppConfigSurveyExportMock} from '../../config/app.config.mock';
import {ExportService} from '../../services/export.service';
import {ExportServiceMock} from '../../services/mocks/export.service.mock';
import {ExportJob} from '../../models/export-models/export-job';
import {GbValidatorsModule} from '../../validators/gb-validators.module';
import {By} from '@angular/platform-browser';
import {ExportFileFormat} from '../../models/export-models/export-file-format';
import {ExportDataType} from '../../models/export-models/export-data-type';

const createMockJob = (id: string, name: string) => {
  const job = new ExportJob();
  job.id = id;
  job.name = name;
  job.status = 'Completed';
  job.userId = 'tester';
  return job;
};

const createMockDataType = (name: string, fileFormats: string[]) => {
  const dataType = new ExportDataType(name, true);
  dataType.fileFormats = fileFormats.map(format => new ExportFileFormat(format, true));
  return dataType;
};

const mockJobs = [createMockJob('1', 'Job 1'), createMockJob('2', 'Job 2')];

const mockDataTypes = [createMockDataType('clinical', ['TSV', 'SPSS'])];


describe('GbExportComponent (dataTable)', () => {

  let component: GbExportComponent;
  let fixture: ComponentFixture<GbExportComponent>;
  let exportService: ExportService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbExportComponent],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        AutoCompleteModule,
        DataListModule,
        CheckboxModule,
        FieldsetModule,
        DataTableModule,
        PanelModule,
        DropdownModule,
        MessagesModule,
        GbValidatorsModule
      ],
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: ExportService,
          useClass: ExportServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    exportService = TestBed.get(ExportService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the export job names', () => {
    exportService.exportJobs = mockJobs;
    expect(component.jobNames).toEqual(['Job 1', 'Job 2']);
  });

  it('should not have a date column selector', () => {
    expect(component.isTransmartSurveyTableDataView).toBeFalsy();
    let dateColumnSelector = fixture.debugElement.query(By.css('.gb-include-date-columns-checkbox'));
    expect(dateColumnSelector).toBeFalsy();
  });

});

describe('GbExportComponent (surveyTable)', () => {

  let component: GbExportComponent;
  let fixture: ComponentFixture<GbExportComponent>;
  let exportService: ExportService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbExportComponent],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        AutoCompleteModule,
        DataListModule,
        CheckboxModule,
        FieldsetModule,
        DataTableModule,
        PanelModule,
        DropdownModule,
        MessagesModule,
        GbValidatorsModule,
      ],
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigSurveyExportMock
        },
        {
          provide: ExportService,
          useClass: ExportServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbExportComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
    exportService = TestBed.get(ExportService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the export job names', () => {
    exportService.exportJobs = mockJobs;
    expect(component.jobNames).toEqual(['Job 1', 'Job 2']);
  });

  it('should have a date column selector', () => {
    exportService.exportDataTypes = mockDataTypes;
    fixture.detectChanges();
    expect(component.isTransmartSurveyTableDataView).toBeTruthy();
    expect(component.isLoadingExportDataTypes).toBeFalsy();
    expect(component.exportDataTypes.length).toEqual(1);
    let dateColumnSelector = fixture.debugElement.query(By.css('.gb-include-date-columns-checkbox'));
    expect(dateColumnSelector).not.toBeNull();
  });

  it('should have a job name field and a create export job button', () => {
    exportService.exportJobs = mockJobs;
    exportService.exportDataTypes = mockDataTypes;
    fixture.detectChanges();
    const exportJobNameInput = fixture.debugElement.query(By.css('#exportJobNameInput')).nativeElement;
    const createExportJob = fixture.debugElement.query(By.css('#create-export-job')).nativeElement;

    expect(exportJobNameInput).toBeDefined();
    expect(createExportJob).toBeDefined();
  });

});
