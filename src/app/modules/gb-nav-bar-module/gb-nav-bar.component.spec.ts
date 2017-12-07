import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbNavBarComponent} from './gb-nav-bar.component';
import {MessagesModule, TabMenuModule} from 'primeng/primeng';
import {RouterModule} from '@angular/router';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';

describe('GbNavBarComponent', () => {
  let component: GbNavBarComponent;
  let fixture: ComponentFixture<GbNavBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbNavBarComponent],
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
          provide: ConstraintService,
          useClass: ConstraintServiceMock
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
