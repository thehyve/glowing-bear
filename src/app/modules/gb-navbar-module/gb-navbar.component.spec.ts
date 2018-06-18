import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbNavbarComponent} from './gb-navbar.component';
import {MessagesModule, TabMenuModule} from 'primeng/primeng';
import {Router, RouterModule} from '@angular/router';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {NavbarService} from '../../services/navbar.service';
import {NavbarServiceMock} from '../../services/mocks/navbar.service.mock';
import {GbMainModule} from '../gb-main-module/gb-main.module';

describe('GbNavbarComponent', () => {
  let component: GbNavbarComponent;
  let fixture: ComponentFixture<GbNavbarComponent>;
  let queryService: QueryService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule,
        TabMenuModule,
        FormsModule,
        GbMainModule,
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
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbNavbarComponent);
    component = fixture.componentInstance;
    queryService = TestBed.get(QueryService);
    router = TestBed.get(Router);
    router.initialNavigation();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set activeItem', () => {
    spyOnProperty(component, 'activeItem', 'set').and.callThrough();
    const dummy = {};
    component.activeItem = dummy;
    expect(component.activeItem).toBe(dummy);
  });

  it('should prevent node drop', () => {
    let func = function () {
    };
    let event = {
      stopPropagation: func,
      preventDefault: func
    };
    spyOn(component, 'preventNodeDrop').and.callThrough();
    spyOn(event, 'stopPropagation').and.callThrough();
    spyOn(event, 'preventDefault').and.callThrough();
    component.preventNodeDrop(event);
    expect(component.preventNodeDrop).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should set items', () => {
    spyOnProperty(component, 'items', 'set').and.callThrough();
    const dummy = [];
    component.items = dummy;
    expect(component.items).toBe(dummy);
  });

  it('should save query', () => {
    spyOn(component, 'saveQuery').and.callThrough();
    component.saveQuery();
    expect(component.saveQuery).toHaveBeenCalled();
    // when queryName is defined
    component.queryName = 'test name';
    spyOn(queryService, 'saveQueryByName').and.callThrough();
    component.saveQuery();
    expect(queryService.saveQueryByName).toHaveBeenCalled();
  });

  it('should handle router events', () => {
    spyOn(router.events, 'subscribe').and.returnValue(event).and.callThrough();
    component.ngOnInit();
    expect(router.events.subscribe).toHaveBeenCalled();
  });

});
