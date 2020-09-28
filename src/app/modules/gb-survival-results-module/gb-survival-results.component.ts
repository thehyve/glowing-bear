import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurvivalResultsService } from 'app/services/survival-results.service';
import { identity, logarithm, logarithmMinusLogarithm, arcsineSquaredRoot } from 'app/models/survival-analysis/confidence-intervals';
import { SelectItem } from 'primeng/api';
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { select, Selection } from 'd3';
import { alphas, CIs, confidenceInterval, SurvivalCurvesDrawing } from 'app/utilities/rendering/survival-curves-drawing';
import { clearResultsToArray } from 'app/models/survival-analysis/survival-curves';
import { PDF } from 'app/models/file-models/pdf';

@Component({
  selector: 'app-gb-survival-results',
  templateUrl: './gb-survival-results.component.html',
  styleUrls: ['./gb-survival-results.component.css']
})
export class GbSurvivalResultsComponent implements OnInit {
  _id: number

  _svgSettings: ElementRef
  colorRange = colorRange
  advancedSettings = false
  _results: SurvivalAnalysisClear



  _activated = false

  _cols = ["Name", "Value"]
  _values = [{ name: "log-rank", value: 0.9 }, { name: "p-val", value: 0.85 }]

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


  constructor(private activatedRoute: ActivatedRoute, private survivalResultsService: SurvivalResultsService) {
    this.survivalResultsService.id.subscribe(id => {
      console.log("survService", this.survivalResultsService)
      this.results = this.survivalResultsService.selectedSurvivalResult
    })
  }

  ngOnInit() {
    this._svg = select('#survivalSvgContainer').append("svg").attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "-10 -20 650 650")
      .attr("font-size", "15px")
      .attr("stroke-width", "1px")
      .append("g").attr("transform", `translate (${this._margins},${this._margins})`)
    this._drawing = new SurvivalCurvesDrawing(this._svg, clearResultsToArray(this._results), 300, this._margins, 160, 300)


    this._drawing._rectHeight = 6
    this._drawing.rectWidth = 1
    console.log("res", this._results)

    this._drawing.buildLines()
    this._drawing.drawCurves()



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

  get groupLogRankTable(): string[][] {
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

  set results(res: SurvivalAnalysisClear) {
    this._results = res
  }

  set ic(ic) {
    this._ic = ic
  }
  get ic() {
    return this._ic
  }
  set alphas(alphas) {
    this._alphas = alphas
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

}
export const colorRange = [
  "#ff4f4f",
  "#99f0dd",
  "#fa8d2d",
  "#5c67e6"
]