/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import {select,scaleLinear, scaleOrdinal, scaleBand, line, nest, curveStepBefore, axisBottom,axisLeft, curveStepAfter,area,event} from 'd3';
import {SurvivalCurve, SurvivalPoint} from 'app/models/survival-analysis/survival-curves'
import { colorRange } from '../gb-survival-res/gb-survival.component';

@Component({
  selector: 'app-gb-chart-container',
  templateUrl: './gb-chart-container.component.html',
  styleUrls: ['./gb-chart-container.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GbChartContainerComponent implements OnInit, OnChanges {




  _curves:SurvivalCurve
  _hidden = new Map<{groupId:string,points:SurvivalPoint[]},boolean>()


  _grid=false


  _selectedInterval:  (sigma:number, point:{timePoint:number,prob:number,cumul:number,remaining:number})=>{inf:number,sup:number}

  _alpha=1.960
 

  constructor() { }

  ngOnInit() {

    /*
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._curves=clearResultsToArray(this._clearRes)
    }).bind(this))
    this.buildLineChart()
    */
  }
  ngOnChanges(anyChange){
    if(this._curves){
      this.buildLineChart()
    }
  }

  @Input()
  set grid(val:boolean){
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

  @Input()
  set curves(cur:SurvivalCurve){
    this._curves=cur
    this._curves.curves.forEach(curve=>{
      this._hidden.set(curve,false)
    })
    
  }

  mouseDebug(){
    console.log("on entend plus chanter les Grueriens")
  }




  buildLineChart(){
    var width = 600
    var height=400
    var margins=10

    var legendxPos= (width-this._curves.curves.length)/2.0 - 30
    var legendyPos= -20
    var legendRadius=5
    var legendInterval=60
    var rectHeight=6
    var rectWidth=2
    select("svg").remove()
    var svg=select('#gb-chart-container-component').append("svg").attr("width","100%")
    .attr("height","100%")
    .attr("font-size","20px")
    .attr("viewBox","-10 -20 650 440")
    .append("g").attr("transform",`translate (${margins},${margins})`)

    var div =select("#gb-chart-container-component").append("div")
    .style("position","absolute")
    .style("opacity",0.0)
    .style("z-index",10)
    .attr("class","tooltip")
    .html("Hello")


    var xaxis=scaleLinear().domain([0,this.findMaxDomain()]).range([0,width])
    var yaxis=scaleLinear().domain([0,1]).range([height,0])

    svg.append("g")
    .attr("transform",`translate(${2*margins},${height-margins})`)
    .call(axisBottom(xaxis))
    .attr("font-size","15px")

    svg.append("g")
    .attr("transform", `translate(${2*margins},${-1*margins})`)
    .call(axisLeft(yaxis))
    .attr("font-size","15px")


    var  colorSet=scaleOrdinal<string,string>().domain(this._curves.curves.map(c=>c.groupId)).range(colorRange)


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
      svg.append("g").selectAll("dot")
      .data(curve.points)
      .enter()
      .filter(d=>d.nofCensorings>0)
      .append("rect")
      .attr("x",d=>xaxis(d.timePoint) -rectWidth/2)
      .attr("y",d=>yaxis(d.prob)-rectHeight/2)
      .attr("transform",`translate(${2*margins},${-1*margins})`)
      .attr("width",rectWidth)
      .attr("height",rectHeight)
      .style("fill",colorSet(curve.groupId))



      svg.append("path").datum(curve.points).attr("fill","none")
      .attr("stroke",colorSet(curve.groupId)).attr("stroke-width",1)
      .attr("transform",`translate(${2*margins},${-1*margins})`)
      .attr("d",lineGen)

      svg.append("g").selectAll("dot")
      .data(curve.points)
      .enter()
      .append("circle")
      .attr("cx",d=>xaxis(d.timePoint))
      .attr("cy",d=>yaxis(d.prob))
      .attr("transform",`translate(${2*margins},${-1*margins})`)
      .attr("r","3px")
      .attr("opacity",0.0)
      .attr("fill","black").on("mouseover",(d)=>{div.transition().duration(100).style("opacity",1.0)
      .style("top",(event.layerY+20) +"px")
      .style("left",event.layerX +"px");
      div.html(generateTooltipHtml(d));
      console.log("hello",legendxPos,legendyPos,d,event)})
      .on("mouseout",()=>{div.transition().duration(100).style("opacity",0.0);
      console.log("bye")})
      
      

      svg.append("circle")

      .attr("cx",legendxPos)
      .attr("cy",legendyPos)
      .attr("r",legendRadius)
      .attr("fill",colorSet(curve.groupId))
      

      svg.append("text")
      .attr("x",legendxPos+7)
      .attr("y",legendyPos + 5)
      .text(curve.groupId)
      legendxPos+=legendInterval
    })

    

   




  }

  findMaxDomain():number{
    var timePoints= this._curves.curves.map(curve =>Math.max(... curve.points.map(point=>point.timePoint)))
    return Math.max( ...timePoints)
  }

}


function generateTooltipHtml(point : SurvivalPoint):string{
  var res=""
  res +="<p>Time point " +point.timePoint.toString()+"<br>\n"
  res +="At risk "+point.atRisk.toString()+"<br>\n"
  res +="Events "+point.nofEvents.toString()+"<br>\n"
  res+="Censoring "+point.nofCensorings.toString()+"</p>\n"

  return res
}