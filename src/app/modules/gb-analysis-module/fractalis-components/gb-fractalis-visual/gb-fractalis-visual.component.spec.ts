import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbFractalisVisualComponent} from './gb-fractalis-visual.component';
import {SelectButtonModule} from 'primeng/primeng';

describe('GbFractalisVisualComponent', () => {
  let component: GbFractalisVisualComponent;
  let fixture: ComponentFixture<GbFractalisVisualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbFractalisVisualComponent],
      imports: [
        SelectButtonModule
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
