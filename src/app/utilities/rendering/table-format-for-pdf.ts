import { NumericalMethodResult } from 'app/models/numerical-models/numerical-operation'
import { ErrorHelper } from '../error-helper'

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
    data[i] = [groupNames[i], groupTotalAtRisk[i], groupTotalEvent[i], groupTotalCensoring[i]]
  }
  return { headers: headers, data: data }
}

export function milestonedSummaryToTable(
  groupNames: string[],
  times: number[],
  summaries: {
    atRisk: number;
    event: number;
  }[][],
): { headers: string[][], data: string[][] } {
  let headers = [['Date time', 'Group name', 'Total at risk', 'Total events']]
  let nofGroups = groupNames.length
  let nofTimes = times.length
  let data = new Array<string[]>()

  if (summaries.length !== nofGroups) {
    throw ErrorHelper.handleNewError('Unexpected error. Number of group names and number of summaries' +
      ` are not the same: found ${nofGroups} and ${summaries.length} respectively`)
  }
  summaries.forEach(oneGroupSummaries => {
    if (oneGroupSummaries.length !== nofTimes) {
      throw ErrorHelper.handleNewError('Unexpected error. Number of times and number of summaries per group' +
        ` are not the same: found ${nofTimes} and ${oneGroupSummaries.length} respectively`)
    }
  })

  for (let i = 0; i < nofTimes; i++) {
    let datum = new Array<string>(4)

    for (let j = 0; j < nofGroups; j++) {
      datum[0] = (j === 0) ? `${i}` : ''
      datum[1] = groupNames[j]
      datum[2] = summaries[j][i].atRisk.toString()
      datum[3] = summaries[j][i].event.toString()

    }
    data.push(datum)
  }
  return { headers: headers, data: data }
}

export function statTestToTable(groupNames: string[], table: NumericalMethodResult[][])
  : { headers: string[][], data: string[][], logs: string[] } {
  let headers = [['Group 1 name', 'Group 2 name', 'Value']]
  let nofGroups = groupNames.length
  let data = new Array<string[]>()
  let logs = new Array<string>()

  for (let i = 0; i < nofGroups; i++) {
    for (let j = i + 1; j < nofGroups; j++) {
      let elm = table[i][j]
      let value: string
      if (!elm.finished) {
        value = 'NA (not completed)'
      }
      if ((elm.errorMessage) && elm.errorMessage !== '') {
        value = 'NA (exception, see logs below)'
        logs.push(`Groups ${groupNames[i]} and ${groupNames[j]}: ${elm.errorMessage}`)
      } else {
        value = elm.result
      }
      data.push([groupNames[i], groupNames[j], value])

    }

  }
  return { headers: headers, data: data, logs: logs }
}
