import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbFractalisVisualComponent} from './gb-fractalis-visual.component';
import {MockComponent} from 'ng2-mock-component';
import {GridsterModule} from 'angular-gridster2';
import {MatIconModule} from '@angular/material';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisServiceMock} from '../../../../services/mocks/fractalis.service.mock';

describe('GbFractalisVisualComponent', () => {
  let component: GbFractalisVisualComponent;
  let fixture: ComponentFixture<GbFractalisVisualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbFractalisVisualComponent,
        MockComponent({selector: 'gb-fractalis-chart', inputs: ['chart']})
      ],
      providers: [
        {
          provide: FractalisService,
          useClass: FractalisServiceMock
        }
      ],
      imports: [
        GridsterModule,
        MatIconModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbFractalisVisualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
