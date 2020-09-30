/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
  Selection, scaleLinear, ScaleLinear, axisBottom,
  event, axisLeft, scaleOrdinal, ScaleOrdinal, scaleBand,
  select, area, curveStepAfter, Line, Area, line, curveStepBefore, BaseType
} from 'd3'
import { SurvivalCurve, SurvivalPoint } from 'app/models/survival-analysis/survival-curves'
import { colorRange } from 'app/modules/gb-survival-results-module/gb-survival-results.component'
import { summaryTable } from 'app/models/survival-analysis/summaryTable'
import { identity, logarithm, logarithmMinusLogarithm, arcsineSquaredRoot } from 'app/models/survival-analysis/confidence-intervals';
import { Observable } from 'rxjs';


export type confidenceInterval = (
  simga: number, point: { timePoint: number, prob: number, cumul: number, remaining: number }
) => { inf: number, sup: number };

export const CIs: Array<{ label: string, value: confidenceInterval }> = [
  { label: 'identity', value: identity },
  { label: 'log', value: logarithm },
  { label: 'log -log', value: logarithmMinusLogarithm },
  { label: 'arcsine squared', value: arcsineSquaredRoot }
]
export const alphas: Array<{ label: string, value: number }> = [{ label: '90%', value: 1.645 }, { label: '95%', value: 1.960 }, { label: '99%', value: 2.054 }]
export class SurvivalCurvesDrawing {
  _svgRef: Selection<SVGGElement, unknown, HTMLElement, any>

  _hGrid: Selection<SVGGElement, unknown, HTMLElement, any>

  _xaxis: ScaleLinear<number, number>
  _yaxis: ScaleLinear<number, number>

  _ticks: number[]

  _colorSet: ScaleOrdinal<string, string>
  _tableHGrid: any
  _summaryDisplay: Selection<SVGGElement, unknown, HTMLElement, any>
  _summaryData = new Array<Selection<BaseType, unknown, SVGGElement, unknown>>()
  _lineGen: Line<{
    timePoint: number;
    prob: number;
    cumul: number;
    remaining: number;
  }>

  _areaGen: Area<{
    timePoint: number;
    prob: number;
    cumul: number;
    remaining: number;
  }>

  _hiding = new Map<string, boolean>()
  rectWidth: number
  _rectHeight: number
  _div: Selection<HTMLDivElement, unknown, HTMLElement, any>
  _groupButton = new Map<string, Selection<SVGCircleElement, unknown, HTMLElement, any>>()

  _legendInterval: number
  _legendxPos: number
  _legendyPos: number
  _legendRadius: number

  // svg element for censoring ticks and tooltips per group
  _singlePoints = new Map<string, Selection<BaseType, unknown, SVGGElement, unknown>>()
  // svg element for confidence interval per group
  _CIs = new Map<string, Selection<SVGPathElement, unknown, HTMLElement, any>>()
  // svg element for curve per group
  _curves = new Map<string, Selection<SVGPathElement, unknown, HTMLElement, any>>()

  constructor(
    svgRef: Selection<SVGGElement, unknown, HTMLElement, any>,
    private curves: SurvivalCurve,
    private width: number,
    private margins: number,
    private survivalTable: number,
    private height: number,
    private notifier: Observable<any> = null,
    public selectedInterval: confidenceInterval = logarithm,
    public alpha: number = 1.960,
    public nofTicks: number = 10,
    public grid: boolean = false
  ) {

    this._legendxPos = (this.width - this.curves.curves.length) / 2.0 - 30
    this._legendyPos = -20
    this._legendRadius = 5
    this._legendInterval = 60
    this._xaxis = scaleLinear().domain([0, this.findMaxDomain()]).range([0, this.width - this.margins])
    this._yaxis = scaleLinear().domain([0, 1]).range([this.survivalTable, 0])

    if (this.notifier) {
      this.notifier.subscribe(() => { this.drawCurves() })
    }

    this._svgRef = svgRef
    this._lineGen = line<{
      timePoint: number;
      prob: number;
      cumul: number;
      remaining: number;
    }>().x(d => this._xaxis(d.timePoint)).y(d => this._yaxis(d.prob)).curve(curveStepBefore);
    this._div = select('app-gb-survival-results').append('div')
      .style('position', 'absolute')
      .style('opacity', 0.0)
      .style('z-index', 10)
      .attr('class', 'tooltip')
      .style('background-color', 'white')
      .html('Hello')
  }

  private findMaxDomain(): number {
    let timePoints = this.curves.curves.map(curve => Math.max(...curve.points.map(point => point.timePoint)))
    return Math.max(...timePoints)
  }
  private generateTooltipHtml(point: SurvivalPoint): string {
    let res = ''
    res += '<p>Time point ' + point.timePoint.toString() + '<br>\n'
    res += 'At risk ' + point.atRisk.toString() + '<br>\n'
    res += 'Events ' + point.cumulEvents.toString() + '<br>\n'
    res += 'Censoring ' + point.cumulCensorings.toString() + '</p>\n'

    return res
  }
  buildLines() {


    this._hGrid = this._svgRef.append('g')
      .attr('transform', `translate(${2 * this.margins},${this.survivalTable - this.margins})`)
      .call(axisBottom(this._xaxis).ticks(this.nofTicks))
      .attr('font-size', '8px')

    // this is tricky, but it works
    let ticks = new Array<number>()
    this._hGrid.selectAll('.tick').each(d => ticks.push(d as number))
    this._ticks = ticks

    this._svgRef.append('g')
      .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
      .call(axisLeft(this._yaxis))
      .attr('font-size', '8px')
    this.curves.curves.forEach(c => {
      this._hiding.set(c.groupId, false)
    })


    this._colorSet = scaleOrdinal<string, string>().domain(this.curves.curves.map(c => c.groupId)).range(colorRange)
    // interactive title
    this.curves.curves.forEach(((curve, index) => {
      this._groupButton.set(curve.groupId, this.toggleStyle(curve.groupId,
        this._svgRef.append('circle')

          .attr('cx', this._legendxPos)
          .attr('cy', this._legendyPos)
          .attr('r', this._legendRadius)
          .on('mousedown', (() => {
            let hidden = !this._hiding.get(curve.groupId)
            this._hiding.set(curve.groupId, hidden);
            if (hidden) {
              this._curves.get(curve.groupId).transition().duration(50).attr('opacity', '0.0')
              this._curves.get(curve.groupId).transition().delay(50).attr('visibility', 'hidden')
              this._CIs.get(curve.groupId).transition().duration(50).attr('opacity', '0.0')
              this._CIs.get(curve.groupId).transition().delay(50).attr('visibility', 'hidden')
              this._svgRef.selectAll('#resultDrawing rect').transition().duration(50).attr('opacity', '0.0')
              this._svgRef.selectAll('#resultDrawing rect').transition().delay(50).attr('visibility', 'hidden')
              this._svgRef.selectAll('#resultDrawing circle').transition().delay(50).attr('visibility', 'hidden')

            } else {
              this._curves.get(curve.groupId).attr('visibility', 'visible')
              this._curves.get(curve.groupId).transition().duration(50).attr('opacity', '1.0')
              this._CIs.get(curve.groupId).attr('visibility', 'visible')
              this._CIs.get(curve.groupId).transition().duration(50).attr('opacity', '0.3')
              this._svgRef.selectAll('#resultDrawing rect').attr('visibility', 'visible')
              this._svgRef.selectAll('#resultDrawing rect').transition().duration(50).attr('opacity', '1.0')
              this._svgRef.selectAll('#resultDrawing circle').transition().attr('visibility', 'visible')
            }

            this.toggleStyle(curve.groupId, this._groupButton.get(curve.groupId));
          }).bind(this))
      )
      )


      this._svgRef.append('text')
        .attr('x', this._legendxPos + 7)
        .attr('y', this._legendyPos + 5)
        .text(index.toString())
      this._legendxPos += this._legendInterval

    }).bind(this))

    // curve references
    let curvePerSe = this._svgRef.append('g').attr('id', 'resultDrawing')
    this.curves.curves.forEach(c => {
      this._singlePoints.set(c.groupId, curvePerSe.append('g').selectAll('dot'))
      this._CIs.set(c.groupId, curvePerSe.append('path'))
      this._curves.set(c.groupId, curvePerSe.append('path'))
    });

    this.buildTable()
  }



  buildTable() {
    let domainPadding = this.findMaxDomain() / (2 * this._ticks.length)
    let xaxis = scaleLinear()
      .domain([-domainPadding, this.findMaxDomain() + domainPadding])
      .range([2 * this.margins, this.width - 2 * this.margins])
    let abscissa = axisBottom(xaxis).tickValues(this._ticks)
    let yaxis = scaleBand().domain(this.curves.curves.map(curve => curve.groupId)).range([this.height, this.survivalTable + 100])
    this._svgRef.append('g')
      .attr('transform', `translate(${6 * this.margins},${-2 * this.margins})`)
      .call(axisLeft(yaxis))
      .attr('font-size', '8px')
    console.log('curves', this.curves.curves)



    this._tableHGrid = this._svgRef.append('g')
      .attr('transform', `translate(${4 * this.margins},${this.height - 2 * this.margins})`)
      .call(abscissa)
      .attr('font-size', '8px')
    this._summaryDisplay = this._svgRef.append('g')

    this.curves.curves.forEach((curve, i) => {
      let summary = summaryTable(curve.points, this._ticks)
      this._summaryData.push(this._summaryDisplay.append('g').selectAll('text'))
      this._summaryData[i]
        .data(summary)
        .enter()
        .append('text')
        .attr('x', (_, j) => xaxis(this._ticks[j]))
        .attr('y', yaxis(curve.groupId))
        .text(d => d.atRisk.toString() + '(' + d.event.toString() + ')')
        .attr('font-size', '8px')
        .attr('transform', `translate(${4 * this.margins},0)`)
        .style('text-anchor', 'middle')

    })
  }
  toggleStyle(
    id: string,
    button: Selection<SVGCircleElement, unknown, HTMLElement, any>
  ): Selection<SVGCircleElement, unknown, HTMLElement, any> {
    if (this._hiding.get(id)) {
      button.transition().duration(200).attr('fill', 'white')
    } else {
      button.transition().duration(200).attr('fill', this._colorSet(id)).transition().delay(200)
    }
    button.attr('stroke', this._colorSet(id))
    return button
  }




  drawCurves() {

    if (this.selectedInterval) {
      this._areaGen = area<{ timePoint: number, prob: number, cumul: number, remaining: number }>()
        .x(d => this._xaxis(d.timePoint))
        .y0(d => this._yaxis(this.selectedInterval(this.alpha, d).inf))
        .y1(d => this._yaxis(this.selectedInterval(this.alpha, d).sup))
        .curve(curveStepAfter)
    }
    console.log('data to be plot', this.curves.curves)
    this.curves.curves.filter(curve => !this._hiding.get(curve.groupId)).forEach(curve => {
      // --- add data and show data
      let singlePointsEnterSelection = this._singlePoints.get(curve.groupId)
        .data(curve.points)
        .enter()
      singlePointsEnterSelection
        .filter(d => d.nofCensorings > 0)
        .append('rect')
        .attr('x', d => this._xaxis(d.timePoint) - this.rectWidth / 2)
        .attr('y', d => this._yaxis(d.prob) - this._rectHeight / 2)
        .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
        .attr('width', this.rectWidth)
        .attr('height', this._rectHeight)
        .style('fill', this._colorSet(curve.groupId))

      if (this.selectedInterval) {
        this._CIs.get(curve.groupId)
          .datum(curve.points)
          .attr('stroke', this._colorSet(curve.groupId))
          .attr('fill', this._colorSet(curve.groupId))
          .attr('opacity', '0.3')
          .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
          .attr('d', this._areaGen)
      }


      console.log('points to show', curve.points, this._lineGen(curve.points))
      this._curves.get(curve.groupId)
        .datum(curve.points).attr('fill', 'none')
        .attr('stroke', this._colorSet(curve.groupId)).attr('stroke-width', 1)
        .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
        .attr('d', this._lineGen)

      singlePointsEnterSelection
        .append('circle')
        .attr('cx', d => this._xaxis(d.timePoint))
        .attr('cy', d => this._yaxis(d.prob))
        .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
        .attr('r', '3px')
        .attr('opacity', 0.0)
        .attr('fill', 'black').on('mouseover', (d) => {
          this._div.transition().style('display', 'block')
          this._div.transition().duration(100).style('opacity', 0.8)
            .style('top', (event.layerY + 20) + 'px')
            .style('left', event.layerX + 'px');
          this._div.html(this.generateTooltipHtml(d))
        })
        .on('mouseout', (() => {
          this._div.transition().duration(100).style('opacity', 0.0)
          this._div.transition().delay(100).style('display', 'none')
        }).bind(this))



    })
  }
  changeIntervals() {
    this._areaGen = area<{ timePoint: number, prob: number, cumul: number, remaining: number }>()
      .x(d => this._xaxis(d.timePoint))
      .y0(d => this._yaxis(this.selectedInterval(this.alpha, d).inf))
      .y1(d => this._yaxis(this.selectedInterval(this.alpha, d).sup))
      .curve(curveStepAfter)

    this.curves.curves.forEach(c => {
      this._CIs.get(c.groupId)
        .datum(c.points)
        .transition()
        .duration(50)
        .attr('stroke', this._colorSet(c.groupId))
        .attr('fill', this._colorSet(c.groupId))
        .attr('opacity', '0.3')
        .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
        .attr('d', this._areaGen)
    })

  }
  changeGrid() {

    if (this._hGrid) {
      this._hGrid.call(axisBottom(this._xaxis).ticks(this.nofTicks))
      let ticks = new Array<number>()
      this._hGrid.selectAll('.tick').each(d => ticks.push(d as number))
      this._ticks = ticks
    }
    let xaxis
    let yaxis
    if (this._tableHGrid) {
      let rightDomainPadding = Math.floor(this.findMaxDomain() / (2 * this._ticks.length))
      let lefttDomainPadding = Math.floor(this.findMaxDomain() / (2 * this._ticks.length))
      xaxis = scaleLinear()
        .domain([-lefttDomainPadding, this.findMaxDomain() + rightDomainPadding])
        .range([2 * this.margins, this.width - 2 * this.margins])
      yaxis = scaleBand()
        .domain(this.curves.curves.map(curve => curve.groupId))
        .range([this.height, this.survivalTable + 100])
      let abscissa = axisBottom(xaxis).tickValues(this._ticks)
      this._tableHGrid.call(abscissa)
    }

    if (this._summaryDisplay) {
      this._summaryDisplay.remove()
      this._summaryDisplay = this._svgRef.append('g')

      this.curves.curves.forEach((curve, i) => {
        if (this._summaryData.length !== 0) {
          this._summaryData[i] = this._summaryDisplay.append('g').selectAll('text')
          let summary = summaryTable(curve.points, this._ticks)
          this._summaryData[i]
            .data(summary)
            .enter()
            .append('text')
            .attr('x', (_, j) => xaxis(this._ticks[j]))
            .attr('y', yaxis(curve.groupId))
            .text(d => d.atRisk.toString() + '(' + d.event.toString() + ')')
            .attr('font-size', '8px')
            .attr('transform', `translate(${4 * this.margins},${1 * this.margins})`)
            .style('text-anchor', 'middle')
        }


      })
    }
    this.toggleGrid()

  }

  toggleGrid() {
    if (this._svgRef) {
      this._svgRef.select('#hGrid').remove()
      this._svgRef.select('#vGrid').remove()
      this._svgRef.select('#summHGrid').remove()
    }

    if (this.grid) {


      this._svgRef.append('g').attr('transform', `translate(${2 * this.margins},${this.survivalTable - this.margins})`)
        .attr('id', 'hGrid')
        .attr('style', 'opacity:0.2')
        .call(axisBottom(this._xaxis)
          .tickValues(this._ticks)
          .tickSize(-(this.survivalTable))
          .tickFormat(() => ''))




      this._svgRef.append('g').attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
        .attr('id', 'vGrid')
        .attr('style', 'opacity:0.2')
        .call(axisLeft(this._yaxis)
          .ticks(10)
          .tickSize(-this.width)
          .tickFormat(() => ''))
      let domainPadding = this.findMaxDomain() / (2 * this._ticks.length)

      let xaxis = scaleLinear().domain([-domainPadding, this.findMaxDomain() + domainPadding])
        .range([2 * this.margins, this.width - 2 * this.margins])

      this._svgRef.append('g').attr('transform', `translate(${4 * this.margins},${this.height - 2 * this.margins})`)
        .attr('id', 'summHGrid')
        .attr('style', 'opacity:0.2')
        .call(axisBottom(xaxis).tickValues(this._ticks)
          .tickSize(-(this.height - this.survivalTable - 100))
          .tickFormat(() => ''))

    }
  }

  updatePoints(idx: number) {
    this.curves.curves[idx]

  }

}
