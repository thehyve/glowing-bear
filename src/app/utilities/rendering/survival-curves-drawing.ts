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
  select, area, curveStepAfter, Line, Area, line, BaseType
} from 'd3'
import { colorRange } from 'app/modules/gb-survival-results-module/gb-survival-results.component'
import { Observable } from 'rxjs';
import { ConfidenceInterval } from 'app/models/survival-analysis/confidence-intervals';
import { SurvivalCurve } from 'app/models/survival-analysis/survival-curves';
import { SurvivalPoint } from 'app/models/survival-analysis/survival-point';



export const CIs: Array<{ label: string, value: ConfidenceInterval }> = [
  { label: 'identity', value: ConfidenceInterval.identity() },
  { label: 'log', value: ConfidenceInterval.logarithm() },
  { label: 'log -log', value: ConfidenceInterval.logarithmMinusLogarithm() },
  { label: 'arcsine squared', value: ConfidenceInterval.arcsineSquaredRoot() }
]
export const alphas: Array<{ label: string, value: number }> = [
  { label: '90%', value: 1.645 },
  { label: '95%', value: 1.960 },
  { label: '99%', value: 2.054 },
]

// this is not elegant, but what works for CIs does not work for alphas: browser freezes
export const alphasReverseMap = new Map<number, string>([[1.645, '90%'], [1.960, '95%'], [2.054, '99%']])

export class SurvivalCurvesDrawing {
  _svgRef: Selection<SVGGElement, unknown, HTMLElement, any>

  _hGrid: Selection<SVGGElement, unknown, HTMLElement, any>

  _xaxis: ScaleLinear<number, number>
  _yaxis: ScaleLinear<number, number>

  _ticks: number[]

  _colorSet: ScaleOrdinal<string, string>
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

  // utility for selection
  _labelClasses = new Map<string, string>()
  // svg element for censoring ticks and tooltips per group
  _singlePoints = new Map<string, Selection<BaseType, unknown, SVGGElement, unknown>>()
  // svg element for confidence interval per group
  _CIs = new Map<string, Selection<SVGPathElement, unknown, HTMLElement, any>>()
  // svg element for curve per group
  _curves = new Map<string, Selection<SVGPathElement, unknown, HTMLElement, any>>()

  _grids: Selection<SVGGElement, unknown, HTMLElement, any>

  constructor(
    svgRef: Selection<SVGGElement, unknown, HTMLElement, any>,
    private curves: SurvivalCurve,
    private width: number,
    private margins: number,
    private survivalTable: number,
    private height: number,
    private granularity: string,
    private notifier: Observable<any> = null,
    public selectedInterval: ConfidenceInterval = ConfidenceInterval.logarithm(),
    public alpha: number = 1.960,
    public nofTicks: number = 10,
    public grid: boolean = false
  ) {

    this._legendxPos = (this.width - this.curves.curves.length) / 2.0 - 30
    this._legendyPos = -25
    this._legendRadius = 4
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
    }>().x(d => this._xaxis(d.timePoint)).y(d => this._yaxis(d.prob)).curve(curveStepAfter);
    this._div = select('#survivalSvgContainer').append('div')
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
    this._grids = this._svgRef.append('g')


    this._hGrid = this._svgRef.append('g')
      .attr('transform', `translate(${2 * this.margins},${this.survivalTable - this.margins})`)
      .call(axisBottom(this._xaxis).ticks(this.nofTicks))
      .attr('font-size', '8px')
      .style('color', 'black')

    // this is tricky, but it works
    let ticks = new Array<number>()
    this._hGrid.selectAll('.tick').each(d => ticks.push(d as number))
    this._ticks = ticks

    this._svgRef.append('g')
      .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
      .call(axisLeft(this._yaxis))
      .attr('font-size', '8px')
      .style('color', 'black')
    this.curves.curves.forEach(({ groupId }, index) => {
      this._hiding.set(groupId, false)
      this._labelClasses.set(groupId, labelClasses[index])
    })

    // time granularity
    this._svgRef.append('text')
      .attr('x', this.width / 2)
      .attr('y', this.survivalTable + 2 * this.margins)
      .text(this.granularity)

    this._colorSet = scaleOrdinal<string, string>().domain(this.curves.curves.map(c => c.groupId)).range(colorRange)

    // interactive title
    this.curves.curves.forEach((curve => {
      this._groupButton.set(curve.groupId, this.toggleStyle(curve.groupId,
        this._svgRef.append('circle')

          .attr('cx', this._legendxPos)
          .attr('cy', this._legendyPos)
          .attr('r', this._legendRadius)
          .on('mousedown', (() => {
            let hidden = !this._hiding.get(curve.groupId)
            this._hiding.set(curve.groupId, hidden);

            if (hidden) {
              let selectedGroup = this._svgRef.selectAll('.' + this._labelClasses.get(curve.groupId))
              selectedGroup.transition().duration(50).attr('opacity', '0.0')
              selectedGroup.transition().delay(50).attr('visibility', 'hidden')

            } else {
              let selectedGroup = this._svgRef.selectAll('.' + this._labelClasses.get(curve.groupId) + ':not(.ci)')
              selectedGroup.transition().attr('visibility', 'visible')
              selectedGroup.transition().duration(50).attr('opacity', '1.0')
              let selectedGroupCI = this._svgRef.selectAll('.ci.' + this._labelClasses.get(curve.groupId))
              selectedGroupCI.transition().attr('visibility', 'visible')
              selectedGroupCI.transition().duration(50).attr('opacity', confidenceIntervalOpacity)

            }

            this.toggleStyle(curve.groupId, this._groupButton.get(curve.groupId));
          }).bind(this))
      )
      )


      this._svgRef.append('text')
        .attr('x', this._legendxPos + 7)
        .attr('y', this._legendyPos + 5)
        .text(curve.groupId)
      this._legendxPos += this._legendInterval

    }).bind(this))

    // curve references
    let curvePerSe = this._svgRef.append('g').attr('id', 'resultDrawing')
    this.curves.curves.forEach(({ groupId }) => {

      this._CIs.set(groupId, curvePerSe.append('path'))
      this._curves.set(groupId, curvePerSe.append('path'))
      this._singlePoints.set(groupId, curvePerSe.append('g').attr('class', this._labelClasses.get(groupId)).selectAll('dot'))
    });

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
        .y0(d => this._yaxis(this.selectedInterval.callback(this.alpha, d).inf))
        .y1(d => this._yaxis(this.selectedInterval.callback(this.alpha, d).sup))
        .curve(curveStepAfter)
    }
    this.curves.curves.filter(curve => !this._hiding.get(curve.groupId)).forEach(curve => {
      // --- add data and show data
      this._curves.get(curve.groupId)
        .datum(curve.points)
        .attr('fill', 'none')
        .attr('class', this._labelClasses.get(curve.groupId))
        .attr('stroke', this._colorSet(curve.groupId)).attr('stroke-width', 1)
        .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
        .attr('d', this._lineGen)


      this._singlePoints.get(curve.groupId)
        .data(curve.points)
        .enter()
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
          .attr('class', this._labelClasses.get(curve.groupId) + ' ci')
          .attr('stroke', this._colorSet(curve.groupId))
          .attr('fill', this._colorSet(curve.groupId))
          .attr('opacity', confidenceIntervalOpacity)
          .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
          .attr('d', this._areaGen)
      }




      this._singlePoints.get(curve.groupId)
        .data(curve.points)
        .enter()
        .append('circle')
        .attr('cx', d => this._xaxis(d.timePoint))
        .attr('cy', d => this._yaxis(d.prob))
        .attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
        .attr('r', '4px')
        .attr('opacity', 0.1)
        .attr('fill', 'grey').on('mouseover', (d) => {
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
      .y0(d => this._yaxis(this.selectedInterval.callback(this.alpha, d).inf))
      .y1(d => this._yaxis(this.selectedInterval.callback(this.alpha, d).sup))
      .curve(curveStepAfter)

    this.curves.curves.forEach(c => {
      this._CIs.get(c.groupId)
        .datum(c.points)
        .transition()
        .duration(50)
        .attr('stroke', this._colorSet(c.groupId))
        .attr('fill', this._colorSet(c.groupId))
        .attr('stroke-opacity', '0.3')
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
    this.toggleGrid()

  }

  toggleGrid() {
    if (this._grids) {
      this._grids.select('#hGrid').remove()
      this._grids.select('#vGrid').remove()
    }

    if (this.grid) {


      this._grids.append('g').attr('transform', `translate(${2 * this.margins},${this.survivalTable - this.margins})`)
        .attr('id', 'hGrid')
        .style('color', '#b8b8b8')
        .call(axisBottom(this._xaxis)
          .tickValues(this._ticks)
          .tickSize(-(this.survivalTable))
          .tickFormat(() => ''))




      this._grids.append('g').attr('transform', `translate(${2 * this.margins},${-1 * this.margins})`)
        .attr('id', 'vGrid')
        .style('color', '#b8b8b8')
        .call(axisLeft(this._yaxis)
          .ticks(10)
          .tickSize(-this.width)
          .tickFormat(() => ''))

    }
  }

  get ticks(): number[] {
    return this._ticks
  }

}

const confidenceIntervalOpacity = '0.3'

const labelClasses = ['group0', 'group1', 'group2', 'group3']
