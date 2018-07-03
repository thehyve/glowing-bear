import {TestBed} from '@angular/core/testing';
import {ResourceService} from '../app/services/resource.service';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {Query} from '../app/models/query-models/query';

describe('Integration test for query saving and restoring', () => {

  let queries: Query[] = [];
  queries.push(new Query('0', 'q0'));
  queries.push(new Query('1', 'q1'));
  queries.push(new Query('2', 'q2'));
  queries[0].createDate = '2018-07-02T10:39:37Z';


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    });
  });

  it('should', () => {

  });
});
