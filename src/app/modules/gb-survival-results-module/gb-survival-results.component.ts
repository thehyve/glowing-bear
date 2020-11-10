/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, ElementRef, OnChanges, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurvivalResultsService } from 'app/services/survival-results.service';
import { SelectItem } from 'primeng/api';
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { select, Selection } from 'd3';
import { alphas, CIs, confidenceInterval, SurvivalCurvesDrawing } from 'app/utilities/rendering/survival-curves-drawing';
import { clearResultsToArray, SurvivalCurve } from 'app/models/survival-analysis/survival-curves';
import { SurvivalSettings } from 'app/models/survival-analysis/survival-settings';
import { NewCoxRegression, coxToString } from 'app/utilities/numerical-methods/cox-model';
import { logRank2Groups } from 'app/utilities/survival-analysis/log-rank-p-value';
import { ChiSquaredCdf } from 'app/utilities/numerical-methods/chi-squared-cdf';
import { summaryTable } from 'app/utilities/survival-analysis/summary-table';
import { PDF } from 'app/models/file-models/pdf';
import { statTestToTable, summaryToTable } from 'app/utilities/rendering/table-format-for-pdf';

@Component({
  selector: 'gb-survival-results',
  templateUrl: './gb-survival-results.component.html',
  styleUrls: ['./gb-survival-results.component.css']
})
export class GbSurvivalResultsComponent implements OnInit {
  _id: number
  colorRange = colorRange
  advancedSettings = false
  _results: SurvivalAnalysisClear
  _inputParameters: SurvivalSettings
  _survivalCurve: SurvivalCurve
  _groupComparisons: SelectItem[]
  _selectedGroupComparison: {
    name1: string,
    name2: string,
    color1: string,
    color2: string,
    logrank: string,
    initialCount1: string,
    initialCount2: string,
    cumulatEvent1: string,
    cumulatEvent2: string,
    cumulatCensoring1: string,
    cumumlatCensoring2: string,
  }



  _activated = false

  _cols = ['Name', 'Value']
  _values = [{ name: 'log-rank', value: 0.9 }, { name: 'p-val', value: 0.85 }]

  _ic = CIs



  _alphas = alphas


  _groupLogrankTable: Array<Array<string>>
  _groupCoxRegTable: Array<Array<string>>
  _groupCoxWaldTable: Array<Array<string>>
  _groupCoxLogtestTable: Array<Array<string>>
  _groupTotalAtRisk: Array<string>
  _groupTotalEvent: Array<string>
  _groupTotalCensoring: Array<string>
  _margins = 10
  _svg: Selection<SVGGElement, unknown, HTMLElement, any>
  _drawing: SurvivalCurvesDrawing

  _groupTables: SelectItem[]
  selectedGroupTable: { legend: string, table: Array<Array<string>> }

  _summaryTableMileStones: number[]
  _summaryTable: { atRisk: number, event: number }[][]





  constructor(private elmRef: ElementRef, private activatedRoute: ActivatedRoute, private survivalResultsService: SurvivalResultsService) {
    this.survivalResultsService.id.subscribe(id => {
      console.log('survService', this.survivalResultsService)
      let resAndSettings = this.survivalResultsService.selectedSurvivalResult
      this.results = resAndSettings.survivalAnalysisClear
      this.inputParameters = resAndSettings.settings
      this.display()
    })

    this._summaryTable = new Array<Array<{ atRisk: number, event: number }>>()
    this._summaryTableMileStones = new Array<number>()
  }

  ngOnInit() {

    this.display()

  }

  display() {
    // -- get the results
    this._survivalCurve = clearResultsToArray(this._results)

    // -- remove previous svg
    let previous = select('#survivalSvgContainer svg')
    if (previous) {
      previous.remove()
    }

    // -- draw svg
    this._svg = select('#survivalSvgContainer').append('svg').attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '-40 -40 450 300')
      .attr('font-size', '8px')
      .attr('stroke-width', '1px')
      .append('g').attr('transform', `translate (${this._margins},${this._margins})`)
    this._drawing = new SurvivalCurvesDrawing(
      this._svg,
      this.survivalCurve,
      300,
      this._margins,
      160,
      300,
      this.inputParameters.timeGranularity
    )


    this._drawing._rectHeight = 6
    this._drawing.rectWidth = 1
    console.log('res', this._results)

    this._drawing.buildLines()
    this._drawing.drawCurves()

    // -- build tables
    this.setGroupComparisons()

    // -- build summary table
    this.updateSummaryTable()
  }

  setGroupComparisons() {
    this._groupLogrankTable = new Array<Array<string>>()
    this._groupCoxRegTable = new Array<Array<string>>()
    this._groupCoxWaldTable = new Array<Array<string>>()
    this._groupTables = new Array<SelectItem>()
    this._groupTotalAtRisk = new Array<string>()
    this._groupTotalCensoring = new Array<string>()
    this._groupTotalEvent = new Array<string>()
    this._groupCoxLogtestTable = new Array<Array<string>>()
    let len = this.survivalCurve.curves.length
    let curveName = this.survivalCurve.curves.map(curve => curve.groupId)
    this._groupComparisons = new Array<SelectItem>()

    for (let i = 0; i < len; i++) {
      let logrankRow = new Array<string>()
      let coxRegRow = new Array<string>()
      let waldCoxRow = new Array<string>()
      let coxLogtestRow = new Array<string>()
      let totalAtRisk: string
      let totalEvent: string
      let totalCensoring: string
      for (let j = /*i+1*/ 0; j < len; j++) {
        let logrank = logRank2Groups(this.survivalCurve.curves[i].points, this.survivalCurve.curves[j].points).toPrecision(3)
        logrankRow.push(logrank)
        let cox = NewCoxRegression([this.survivalCurve.curves[i].points, this.survivalCurve.curves[j].points], 1000, 1e-14, 'breslow').run()
        let beta = cox.finalBeta[0]
        let variance = cox.finalCovarianceMatrixEstimate[0][0]
        let coxReg = coxToString(beta, variance)
        let waldStat = Math.pow(beta, 2) / (variance + 1e-14)
        let waldTest = (1.0 - ChiSquaredCdf(waldStat, 1)).toPrecision(3)
        let likelihoodRatio = 2.0 * (cox.finalLogLikelihood - cox.initialLogLikelihood)
        let coxLogtest = (1.0 - ChiSquaredCdf(likelihoodRatio, 1)).toPrecision(3)
        console.log('loglikelihoodRatio', likelihoodRatio, 'logtest pvalue', coxLogtest)
        coxRegRow.push(coxReg)
        waldCoxRow.push(waldTest)
        coxLogtestRow.push(coxLogtest)
        totalAtRisk = this.survivalCurve.curves[i].points[0].atRisk.toString()
        totalEvent = this.survivalCurve.curves[i].points.map(p => p.nofEvents).reduce((a, b) => a + b).toString()
        totalCensoring = this.survivalCurve.curves[i].points.map(p => p.nofCensorings).reduce((a, b) => a + b).toString()
        this._groupComparisons.push({
          label: curveName[i] + curveName[j], value: {
            name1: curveName[i],
            name2: curveName[j],
            color1: colorRange[i],
            color2: colorRange[j],
            logrank: logrank,
            coxReg: coxReg,
            initialCount1: totalAtRisk,
            initialCount2: this.survivalCurve.curves[j].points[0].atRisk.toString(),
            cumulatEvent1: totalEvent,
            cumulatEvent2: this.survivalCurve.curves[j].points.map(p => p.nofEvents).reduce((a, b) => a + b).toString(),
            cumulatCensoring1: totalCensoring,
            cumulatCensoring2: this.survivalCurve.curves[j].points.map(p => p.nofCensorings).reduce((a, b) => a + b).toString(),
          }
        })

      }
      this._groupLogrankTable.push(logrankRow)
      this._groupCoxRegTable.push(coxRegRow)
      this._groupCoxWaldTable.push(waldCoxRow)
      this._groupTotalEvent.push(totalEvent)
      this._groupTotalCensoring.push(totalCensoring)
      this._groupTotalAtRisk.push(totalAtRisk)
      this._groupCoxLogtestTable.push(coxLogtestRow)

    }
    this._groupTables.push(
      { label: 'Haenszel-Mantel LogRank p-value', value: { legend: 'KM p-value', table: this._groupLogrankTable } },
      { label: 'Cox regression proportional hazard ratio', value: { legend: 'Cox PH, [95% CI]', table: this._groupCoxRegTable } },
      { label: 'Cox regression Wald test p-value', value: { legend: 'Wald p-value', table: this._groupCoxWaldTable } },
      { label: 'Cox likelihood ratio p-value', value: { legend: 'Logtest p-vale', table: this._groupCoxLogtestTable } })
    this.selectedGroupTable = { legend: 'KM p-value', table: this._groupLogrankTable }

    if (len) {
      this._selectedGroupComparison = this._groupComparisons[0].value
    }
  }

  updateSummaryTable() {
    this._summaryTableMileStones = this._drawing.ticks
    this._survivalCurve.curves.forEach(({ points }, index) => {
      this._summaryTable[index] = summaryTable(points, this._summaryTableMileStones)
    })
  }

  exportSVG(event: Event) {
    let tables: { headers: string[][], data: string[][] }

    console.log('getting elements')

    let svg = this.elmRef.nativeElement.querySelector('#survivalSvgContainer svg')
    let can = this.elmRef.nativeElement.querySelector('#drawingconv')

    let pdfDoc = new PDF()

    pdfDoc.addImage(svg, can, 0, 0, 220, 120)
    pdfDoc.addOneLineText('Settings')
    tables = this.inputParameters.mainSettingsToTable()
    pdfDoc.addTableFromObjects(tables.headers, tables.data)
    if (this.inputParameters.subGroupTextRepresentations && this.inputParameters.subGroupTextRepresentations.length > 0) {
      pdfDoc.addOneLineText('Definitions of sub groups')
      tables = this.inputParameters.subGroupsToTable()
      pdfDoc.addTableFromObjects(tables.headers, tables.data)
    }
    let curveNames = this.survivalCurve.curves.map(({ groupId }) => groupId)
    pdfDoc.addOneLineText('Summary')
    tables = summaryToTable(curveNames, this.groupTotalAtRisk, this.groupTotalEvent, this.groupTotalCensoring)
    pdfDoc.addTableFromObjects(tables.headers, tables.data)

    if (curveNames.length > 1) {
      pdfDoc.addOneLineText('Logrank')
      console.log(`Debug: curveNames length: ${curveNames.length}; groupLogrank length: ${this.groupLogrankTable}`)
      tables = statTestToTable(curveNames, this.groupLogrankTable)
      pdfDoc.addTableFromObjects(tables.headers, tables.data)

      pdfDoc.addOneLineText('Cox regression coefficient')
      tables = statTestToTable(curveNames, this.groupCoxRegTable)
      pdfDoc.addTableFromObjects(tables.headers, tables.data)

      pdfDoc.addOneLineText('Cox regression wald test')
      tables = statTestToTable(curveNames, this.groupCoxWaldTable)
      pdfDoc.addTableFromObjects(tables.headers, tables.data)

      pdfDoc.addOneLineText('Logtest')
      tables = statTestToTable(curveNames, this.groupCoxLogtestTable)
      pdfDoc.addTableFromObjects(tables.headers, tables.data)
    }

    let exportDate = new Date(Date.now())
    pdfDoc.export(`medco_survival_analysis_${exportDate.toISOString()}.pdf`)
  }

  set id(i: number) {
    this._id = i
  }
  get id(): number {
    return this._id
  }
  set groupLogrankTable(table: string[][]) {
    this._groupLogrankTable = table
  }

  get groupLogrankTable(): string[][] {
    return this._groupLogrankTable
  }
  set groupCoxRegTable(table: string[][]) {
    this._groupCoxRegTable = table
  }

  get groupCoxRegTable(): string[][] {
    return this._groupCoxRegTable
  }
  set groupCoxWaldTable(table: string[][]) {
    this._groupCoxWaldTable = table
  }

  get groupCoxWaldTable(): string[][] {
    return this._groupCoxWaldTable
  }
  set groupCoxLogtestTable(table: string[][]) {
    this._groupCoxLogtestTable = table
  }

  get groupCoxLogtestTable(): string[][] {
    return this._groupCoxLogtestTable
  }
  set groupTotalAtRisk(risks: string[]) {
    this._groupTotalAtRisk = risks
  }
  get groupTotalAtRisk(): string[] {
    return this._groupTotalAtRisk
  }
  set groupTotalEvent(events: string[]) {
    this._groupTotalEvent = events
  }
  get groupTotalEvent(): string[] {
    return this._groupTotalEvent
  }
  set groupTotalCensoring(censoring: string[]) {
    this._groupTotalCensoring = censoring
  }
  get groupTotalCensoring(): string[] {
    return this._groupTotalCensoring
  }

  set results(res: SurvivalAnalysisClear) {
    this._results = res
  }

  set inputParameters(parameters: SurvivalSettings) {
    this._inputParameters = parameters
  }

  get inputParameters(): SurvivalSettings {
    return this._inputParameters
  }

  get survivalCurve(): SurvivalCurve {
    return this._survivalCurve
  }

  get groupTables(): SelectItem[] {
    return this._groupTables
  }



  set ic(ic) {
    this._ic = ic
  }
  get ic() {
    return this._ic
  }
  set alphas(alp) {
    this._alphas = alp
  }
  get alphas() {
    return this._alphas
  }

  set selectedIc(ci: confidenceInterval) {
    if (this._drawing) {
      this._drawing.selectedInterval = ci
      this._drawing.changeIntervals()
    }
  }
  get selectedIc(): confidenceInterval {

    return (this._drawing) ? this._drawing.selectedInterval : null

  }

  set selectedAlpha(alpha: number) {
    if (this._drawing) {
      this._drawing.alpha = alpha
      this._drawing.changeIntervals()
    }

  }
  get selectedAlpha(): number {
    return (this._drawing) ? this._drawing.alpha : null
  }

  get nofTicks(): number {
    return (this._drawing) ? this._drawing.nofTicks : null
  }

  set nofTicks(ticks: number) {
    if (this._drawing) {
      this._drawing.nofTicks = ticks
      this._drawing.changeGrid()
      this.updateSummaryTable()
    }
  }

  set grid(g: boolean) {
    if (this._drawing) {
      this._drawing.grid = g
      this._drawing.toggleGrid()
    }
  }

  get grid(): boolean {
    return (this._drawing) ? this._drawing.grid : null
  }

  get summaryTableMileStones(): number[] {
    return this._summaryTableMileStones
  }

  get summaryTable(): {
    atRisk: number;
    event: number;
  }[][] {
    return this._summaryTable
  }

}
export const colorRange = [
  '#ff4f4f',
  '#99f0dd',
  '#fa8d2d',
  '#5c67e6'
]
