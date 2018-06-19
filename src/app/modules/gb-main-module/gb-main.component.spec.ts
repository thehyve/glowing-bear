import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {APP_BASE_HREF} from '@angular/common';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {NavbarService} from '../../services/navbar.service';
import {NavbarServiceMock} from '../../services/mocks/navbar.service.mock';
import {GbMainComponent} from './gb-main.component';
import {BrowserModule} from '@angular/platform-browser';
import {GbSidePanelModule} from '../gb-side-panel-module/gb-side-panel.module';
import {HttpClientModule} from '@angular/common/http';
import {GrowlModule} from 'primeng/growl';
import {GbAnalysisModule} from '../gb-analysis-module/gb-analysis.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GbNavBarModule} from '../gb-navbar-module/gb-navbar.module';
import {GbDataSelectionModule} from '../gb-data-selection-module/gb-data-selection.module';
import {TransmartResourceService} from '../../services/transmart-services/transmart-resource.service';
import {DataTableService} from '../../services/data-table.service';
import {ExportService} from '../../services/export.service';
import {CrossTableServiceMock} from '../../services/mocks/cross-table.service.mock';
import {TransmartResourceServiceMock} from '../../services/mocks/transmart-resource.service.mock';
import {CrossTableService} from '../../services/cross-table.service';
import {TreeNodeServiceMock} from '../../services/mocks/tree-node.service.mock';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {ConstraintService} from '../../services/constraint.service';
import {ExportServiceMock} from '../../services/mocks/export.service.mock';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {ResourceService} from '../../services/resource.service';
import {TreeNodeService} from '../../services/tree-node.service';
import {DataTableServiceMock} from '../../services/mocks/data-table.service.mock';
import {AuthenticationServiceMock} from '../../services/mocks/authentication.service.mock';

describe('GbMainComponent', () => {
  let component: GbMainComponent;
  let fixture: ComponentFixture<GbMainComponent>;
  let authService: AuthenticationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbMainComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        GrowlModule,
        GbNavBarModule,
        GbSidePanelModule,
        GbDataSelectionModule,
        GbAnalysisModule,
        routing
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
        },
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
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
    fixture = TestBed.createComponent(GbMainComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    authService = TestBed.get(AuthenticationService);
  })

  it('should be created', () => {
    expect(component).toBeTruthy();
  });


  it('should handle mouse down, indicating the gutter is being dragged, and setting its position', () => {
    let e = new Event('');
    let spy1 = spyOn(e, 'preventDefault').and.stub();
    component.gutter = {
      nativeElement: {
        offsetLeft: 10
      }
    };
    component.x_pos = 27;
    component.onMouseDown(e);
    expect(spy1).toHaveBeenCalled();
    expect(component.isGutterDragged).toBe(true);
    expect(component.x_gap).toEqual(17);
  })

  it('should handle mouse up, indicating the gutter is being dragged no more', () => {
    let e = new Event('');
    component.onMouseUp(e);
    expect(component.isGutterDragged).toBe(false);
  })

  it('should handle resize, resetting elements style widths', () => {
    let e = new Event('');
    component.leftPanel = {
      nativeElement: {
        style: {
          width: 'some width left'
        }
      }
    };
    component.rightPanel = {
      nativeElement: {
        style: {
          width: 'some width right'
        }
      }
    };
    let spy1 = spyOn(component, 'adjustNavbarWidth').and.stub();
    component.onResize(e);
    expect(spy1).toHaveBeenCalled();
    expect(component.leftPanel.nativeElement.style.width).toEqual('');
    expect(component.rightPanel.nativeElement.style.width).toEqual('');

    component.leftPanel = {
      nativeElement: {
        style: {
          width: ''
        }
      }
    };
    component.rightPanel = {
      nativeElement: {
        style: {
          width: ''
        }
      }
    };
    component.onResize(e);
    expect(component.leftPanel.nativeElement.style.width).toEqual('');
    expect(component.rightPanel.nativeElement.style.width).toEqual('');
  })

  it('should handle mouse move, when dragged, calculate left and right widths', () => {
    let e = new MouseEvent('');
    spyOnProperty(e, 'pageX', 'get').and.returnValue(35);
    let spy1 = spyOn(component, 'adjustNavbarWidth').and.stub();
    component.leftPanel = {
      nativeElement: {
        style: {
          width: 'some width left'
        }
      }
    };
    component.rightPanel = {
      nativeElement: {
        style: {
          width: 'some width right'
        }
      }
    };
    component.leftPanel = {
      nativeElement: {
        style: {
          width: 'some width left'
        }
      }
    };
    component.parentContainer = {
      nativeElement: {
        getBoundingClientRect: function () {
          return {width: 100}
        }
      }
    };
    component.isGutterDragged = false;
    component.onMouseMove(e);
    expect(spy1).not.toHaveBeenCalled();

    component.isGutterDragged = true;
    component.x_gap = 9;
    component.onMouseMove(e);
    expect(spy1).toHaveBeenCalled();
    expect(component.leftPanel.nativeElement.style.width).toEqual('26px');
    expect(component.rightPanel.nativeElement.style.width).toEqual('58px');
  })

  it('should adjust navbar width according to the drag', () => {
    component.parentContainer = {
      nativeElement: {
        querySelector: function () {
        }
      }
    };
    let navbarObj = {
      style: {
        width: 'some width'
      }
    }
    let spy1 = spyOn(component.parentContainer.nativeElement, 'querySelector').and.callFake(() => {
      return navbarObj;
    });
    component.leftPanel = {
      nativeElement: {
        clientWidth: 101
      }
    }
    component.rightPanel = {
      nativeElement: {
        clientWidth: 30
      }
    }
    component.adjustNavbarWidth();
    let percent = 30 / 167 * 100;
    expect(spy1).toHaveBeenCalled();
    let navbarPercent = Number(navbarObj.style.width.substring(0, navbarObj.style.width.length - 1));
    expect(navbarPercent).toBeCloseTo(percent);

    navbarObj = null;
    component.adjustNavbarWidth();
    expect(navbarObj).toBe(null);
  })

  it('should log out', () => {
    let spy = spyOn(authService, 'logout').and.stub();
    component.logout();
    expect(spy).toHaveBeenCalled();
  })
});
