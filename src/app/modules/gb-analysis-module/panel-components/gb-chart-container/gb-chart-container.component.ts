import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {select,scaleLinear, scaleOrdinal, scaleBand, line, nest, curveStepBefore, axisBottom,axisLeft, curveStepAfter,area} from 'd3';
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';
import {SurvivalCurve,clearResultsToArray,retrieveGroupIds} from 'app/models/survival-analysis/survival-curves'

@Component({
  selector: 'app-gb-chart-container',
  templateUrl: './gb-chart-container.component.html',
  styleUrls: ['./gb-chart-container.component.css']
})
export class GbChartContainerComponent implements OnInit, OnChanges {

  _clearRes :SurvivalAnalysisClear

  _curves:SurvivalCurve

  _grid=false


  _selectedInterval:  (sigma:number, point:{timePoint:number,prob:number,cumul:number,remaining:number})=>{inf:number,sup:number}

  _alpha=1.960
 

  constructor(private survivalService: SurvivalAnalysisServiceMock) { }

  ngOnInit() {
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._curves=clearResultsToArray(this._clearRes)
    }).bind(this))
    this.buildLineChart()
  }
  ngOnChanges(anyChange){
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._curves=clearResultsToArray(this._clearRes)
    }).bind(this))
    this.buildLineChart()
  }

  @Input()
  set grid(val:boolean){
    console.log("grid",this._grid)
    this._grid=val
  }

  get grid():boolean{
    return this._grid
  }

  @Input()
  set selectedInterval(interval){
    this._selectedInterval=interval
  }

  get selectedInterval(){
    return this._selectedInterval
  }

  @Input()
  set alpha(num:number){
    this._alpha=num
  }

  get alpha():number{
    return (this._alpha)
  }


  buildLineChart(){
    var width = 800
    var height=400
    var margins=10
    select("svg").remove()
    var svg=select('#gb-chart-container-component').append("svg").attr("width","100%")
    .attr("height","100%")
    .attr("viewBox","-10 -10 850 450")
    .append("g").attr("transform",`translate (${margins},${margins})`)

    var xaxis=scaleLinear().domain([0,10]).range([0,width])
    var yaxis=scaleLinear().domain([0,1]).range([height,0])

    svg.append("g").attr("transform",`translate(${2*margins},${height-margins})`).call(axisBottom(xaxis))

    svg.append("g").attr("transform", `translate(${2*margins},${-1*margins})`).call(axisLeft(yaxis))

    var  colorSet=scaleOrdinal<string,string>().domain(retrieveGroupIds(this._clearRes)).range([
      "#ff4f4f",
      "#99f0dd",
      "#fa8d2d",
      "#5c67e6"
    ])


    if(this._grid){

    svg.append("g").attr("transform",`translate(${2*margins},${height-margins})`)
      .attr("style","opacity:0.2")
      .call(axisBottom(xaxis)
      .ticks(10)
      .tickSize(-height)
      .tickFormat(()=>""))

    svg.append("g").attr("transform",`translate(${2*margins},${-1*margins})`)
      .attr("style","opacity:0.2")
      .call(axisLeft(yaxis)
      .ticks(10)
      .tickSize(-width)
      .tickFormat(()=>""))
    }





   

    var lineGen=line<{timePoint:number,prob:number,cumul:number,remaining:number}>()
    .x(d=>xaxis(d.timePoint))
    .y(d=>yaxis(d.prob))
    .curve(curveStepAfter)
 /*
    var areaGen=area<{timePoint:number,prob:number,cumul:number,remaining:number}>()
    .x(d=>xaxis(d.timePoint))
    .y0(d=>yaxis(d.prob +0.1))
    .y1(d=>yaxis(d.prob-0.1) )
    .curve(curveStepAfter)
    */
    
    if (this._selectedInterval){
      var areaGen=area<{timePoint:number,prob:number,cumul:number,remaining:number}>()
    .x(d=>xaxis(d.timePoint))
    .y0(d=>yaxis(this._selectedInterval(this._alpha,d).inf))
    .y1(d=>yaxis(this._selectedInterval(this._alpha,d).sup) )
    .curve(curveStepAfter)
    this._curves.curves.forEach(curve =>{
      svg.append("path").datum(curve.points)
        .attr("stroke",colorSet(curve.groupId))
        .attr("fill",colorSet(curve.groupId))
        .attr("opacity","0.3")
        .attr("transform",`translate(${2*margins},${-1*margins})`)
        .attr("d",areaGen)
    })
  }

    this._curves.curves.forEach(curve =>{
      console.log("curve.groupId",curve.groupId)
      console.log("colorset",colorSet(curve.groupId))



      svg.append("path").datum(curve.points).attr("fill","none")
      .attr("stroke",colorSet(curve.groupId)).attr("stroke-width",1)
      .attr("transform",`translate(${2*margins},${-1*margins})`)
      .attr("d",lineGen)
    })

   




  }

}
