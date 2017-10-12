import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbNavBarComponent} from './gb-nav-bar.component';
import {TabMenuModule} from 'primeng/primeng';
import {RouterModule} from '@angular/router';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {routing} from '../../app.routing';

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
        routing
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        },
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
