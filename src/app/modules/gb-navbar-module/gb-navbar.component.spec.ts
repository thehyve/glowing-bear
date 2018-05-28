import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbNavbarComponent} from './gb-navbar.component';
import {MessagesModule, TabMenuModule} from 'primeng/primeng';
import {RouterModule} from '@angular/router';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {NavbarService} from '../../services/navbar.service';
import {NavbarServiceMock} from '../../services/mocks/navbar.service.mock';
import {MessageService} from '../../services/message.service';
import {MessageServiceMock} from '../../services/mocks/message.service.mock';
import {GbAutoLoginComponent} from '../../gb-auto-login.component';

describe('GbNavbarComponent', () => {
  let component: GbNavbarComponent;
  let fixture: ComponentFixture<GbNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbNavbarComponent,
        GbAutoLoginComponent
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
        },
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
