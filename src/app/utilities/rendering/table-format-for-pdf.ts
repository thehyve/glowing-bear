export function summaryToTable(
  groupNames: string[],
  groupTotalAtRisk: string[],
  groupTotalEvent: string[],
  groupTotalCensoring: string[]
): { headers: string[][], data: string[][] } {
  let headers = [['Group name', 'Total at risk', 'Total events', 'Total censoring']]
  let nofGroups = groupNames.length
  let data = new Array<string[]>(nofGroups)

  for (let i = 0; i < nofGroups; i++) {
    data[i] = [groupTotalAtRisk[i], groupTotalEvent[i], groupTotalCensoring[i]]
  }
  return { headers: headers, data: data }
}

export function statTestToTable(groupNames: string[], table: string[][]) {
  let headers = [['Group 1 name', 'Group 2 name', 'Value']]
  let nofGroups = groupNames.length
  let data = new Array<string[]>()

  for (let i = 0; i < nofGroups; i++) {
    for (let j = i + 1; j < nofGroups; j++) {
      data.push([groupNames[i], groupNames[j], table[i][j]])

    }

  }
  return { headers: headers, data: data }
}
