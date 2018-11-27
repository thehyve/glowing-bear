import {TestBed} from '@angular/core/testing';

import {FractalisService} from './fractalis.service';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ConstraintService} from './constraint.service';

describe('FractalisService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: AuthenticationService,
        useClass: AuthenticationServiceMock
      },
      {
        provide: ConstraintService,
        useClass: ConstraintServiceMock
      },
    ]
  }));

  it('should be created', () => {
    const service: FractalisService = TestBed.get(FractalisService);
    expect(service).toBeTruthy();
  });
});
