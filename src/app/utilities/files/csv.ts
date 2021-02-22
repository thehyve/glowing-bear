/**
 * Copyright 2020-2021 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function matrixToCSV(headers: string[], data: number[][]): string {
  const csv = data.map((row) => row.join(','));
  return headers.join(',') + '\r\n' + csv.join('\r\n');
}

export function transposeMatrix(data: number[][]): number[][] {
  let transposed = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (!transposed[j]) {
        transposed[j] = [];
      }

      transposed[j][i] = data[i][j];
    }
  }
  return transposed;
}

export function savePatientListToCSVFile(fileName: string, nodeNames: string[], patientLists: number[][]) {
  let exportFileEL = document.createElement('a');
  let blob = new Blob([matrixToCSV(nodeNames, transposeMatrix(patientLists))], { type: 'text/csv' });
  let url = window.URL.createObjectURL(blob);
  exportFileEL.href = url;
  exportFileEL.download = `${fileName}.csv`;
  exportFileEL.click();
  window.URL.revokeObjectURL(url);
  exportFileEL.remove();
}
