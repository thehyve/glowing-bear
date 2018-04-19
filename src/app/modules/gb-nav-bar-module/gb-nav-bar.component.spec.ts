import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbNavBarComponent} from './gb-nav-bar.component';
import {MessagesModule, TabMenuModule} from 'primeng/primeng';
import {RouterModule} from '@angular/router';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {AutoLoginComponent} from '../../auto-login.component';

describe('GbNavBarComponent', () => {
  let component: GbNavBarComponent;
  let fixture: ComponentFixture<GbNavBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbNavBarComponent,
        AutoLoginComponent
      ],
      imports: [
        CommonModule,
        RouterModule,
        TabMenuModule,
        FormsModule,
        MessagesModule,
        routing
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbNavBarComponent', () => {
    expect(component).toBeTruthy();
  });
});
