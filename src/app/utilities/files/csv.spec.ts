/**
 * Copyright 2021 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {matrixToCSV, transposeMatrix} from './csv';

describe('CSV Generation Test', () => {
  let nodeNames = ['test-node-0', 'test-node-1', 'test-node-2', 'test-node-3', 'test-node-4', 'test-node-5'];
  let patientLists = [
    [-1, 0, 1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11],
    [],
    [-1, 0, 1, 2, 3]
  ];

  it('should generate a CSV with the right format', () => {
    const csv = matrixToCSV(nodeNames, transposeMatrix(patientLists));
    let res = `test-node-0,test-node-1,test-node-2,test-node-3,test-node-4,test-node-5
-1,4,7,10,,-1
0,5,8,11,,0
1,6,9,,,1
2,,,,,2
3,,,,,3`;
    expect(res.replace(/\s/g, '') === csv.replace(/\s/g, '')).toBeTrue();
  })
});
