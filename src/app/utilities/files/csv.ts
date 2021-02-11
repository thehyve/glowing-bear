function numberMatrixToCSV(data: number[][]) {
  const csv = data.map((row) => row.toString());
  return csv.join('\r\n');
}

export function savePatientListToCSVFile(fileName: string, patientLists: number[][]) {
  const csvContent = numberMatrixToCSV(patientLists)

  let exportFileEL = document.createElement('a');
  let blob = new Blob([csvContent], { type: 'text/csv' });
  let url = window.URL.createObjectURL(blob);
  exportFileEL.href = url;
  exportFileEL.download = `${fileName}.csv`;
  exportFileEL.click();
  window.URL.revokeObjectURL(url);
  exportFileEL.remove();
}
