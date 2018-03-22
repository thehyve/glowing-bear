import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableDimensionsComponent} from './gb-table-dimensions.component';
import {TableService} from '../../../../services/table.service';
import {CheckboxModule, PickListModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {ResourceHelperService} from "../../../../services/resource-helper.service";
import {ResourceHelperServiceMock} from "../../../../services/mocks/resource-helper.service.mock";

describe('GbTableDimensionsComponent', () => {
  let component: GbTableDimensionsComponent;
  let fixture: ComponentFixture<GbTableDimensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbTableDimensionsComponent],
      imports: [
        PickListModule,
        CheckboxModule,
        FormsModule,
        BrowserModule
      ],
      providers: [
        TableService,
        {
          provide: ResourceHelperService,
          useClass: ResourceHelperServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbTableDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbTableDimensionsComponent', () => {
    expect(component).toBeTruthy();
  });
});
