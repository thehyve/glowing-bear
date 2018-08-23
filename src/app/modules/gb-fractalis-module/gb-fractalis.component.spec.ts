import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {GbFractalisComponent} from './gb-fractalis.component';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../../services/mocks/authentication.service.mock';

describe('GbFractalisComponent', () => {
  let component: GbFractalisComponent;
  let fixture: ComponentFixture<GbFractalisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbFractalisComponent],
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbFractalisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
