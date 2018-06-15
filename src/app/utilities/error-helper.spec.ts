import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHelper} from './error-helper';
import {HttpHeaders} from '@angular/common/http';

describe('ErrorHelper.handleError', () => {

  it('logs an http error', () => {
    let error = new HttpErrorResponse({
      error: 'Unauthorized user',
      headers: new HttpHeaders(),
      status: 401,
      statusText: 'Unauthorized user',
      url: 'http://example.com'
    });

    console.error = jasmine.createSpy('error');
    ErrorHelper.handleError(error);
    expect(console.error).toHaveBeenCalledTimes(2);
  });

});
