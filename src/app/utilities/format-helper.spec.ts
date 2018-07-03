/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {FormatHelper} from './format-helper';
import * as moment from 'moment';

describe('FormatHelper.formatCountNumber', () => {

  it('correctly formats numbers', () => {
    let expected = new Map<number, string>();
    expected.set(123, '123');
    expected.set(1234, '1,234');
    expected.set(-1, '...');
    expected.set(0, '0');
    expected.set(undefined, '...');
    expected.set(null, '...');

    expected.forEach((expectedResult, value) =>
      expect(FormatHelper.formatCountNumber(value)).toEqual(expectedResult)
    );
  });

});

function dateFromSecondsAgo(now: number, secondsAgo: number): Date {
  return moment(now).subtract(secondsAgo, 'seconds').toDate();
}

describe('FormatHelper.formatDateSemantics', () => {

  it('correctly formats dates', () => {
    let expected = new Map<number, string>();
    expected.set(60 * 60, '1 hour ago');
    expected.set(60, '1 minute ago');
    expected.set(59 * 60 + 30, '59 minutes ago');
    expected.set(59 * 60 + 45, '59 minutes ago');
    expected.set(2 * 60, '2 minutes ago');
    expected.set(2 * 60 + 14, '2 minutes ago');
    expected.set(3 * 60 * 60 * 24 + 2000, '3 days ago');
    expected.set(-60 * 60, 'in 1 hour');
    expected.set(0, 'now');

    expected.set(60 * 60 * 24 * 16.3, '16 days ago');
    expected.set(60 * 60 * 24 * 45.7, '1 month ago');
    expected.set(60 * 60 * 24 * 98.2, '3 months ago');
    expected.set(60 * 60 * 24 * 540.1, '1 year ago');
    expected.set(60 * 60 * 24 * 365 * 14.9, '14 years ago');

    const mockDate = Date.now();
    spyOn(Date, 'now').and.callFake(() => mockDate);
    expected.forEach((expectedResult, secondsAgo) =>
      expect(FormatHelper.formatDateSemantics(dateFromSecondsAgo(mockDate, secondsAgo )))
        .toEqual(expectedResult)
    );
  });

});

describe('FormatHelper.percentage', () => {

  it('correctly formats percentages', () => {
    expect(FormatHelper.percentage(1, 100)).toEqual('(1%)');
    expect(FormatHelper.percentage(100, 100)).toEqual('(100%)');
    expect(FormatHelper.percentage(100, 1000)).toEqual('(10%)');
    expect(FormatHelper.percentage(3256, 10)).toEqual('(32560%)');
    expect(FormatHelper.percentage(3, 9)).toEqual('(33%)');
    expect(FormatHelper.percentage(0, 80)).toEqual('(0%)');

    // negative numbers
    expect(FormatHelper.percentage(-400, 800)).toEqual('');
    expect(FormatHelper.percentage(-20, -80)).toEqual('');

    // zero or empty divisor
    expect(FormatHelper.percentage(0, 0)).toEqual('');
    expect(FormatHelper.percentage(20, 0)).toEqual('');
    expect(FormatHelper.percentage(20, null)).toEqual('');

    // empty numerator
    expect(FormatHelper.percentage(null, 20)).toEqual('');
  });

});
