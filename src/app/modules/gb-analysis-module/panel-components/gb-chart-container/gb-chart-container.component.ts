/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, Input, OnChanges, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import {select,scaleLinear, scaleOrdinal, scaleBand, line, nest, curveStepBefore, axisBottom,axisLeft, curveStepAfter,area,event,Selection,ScaleOrdinal,ScaleLinear,Line,Area,range, BaseType} from 'd3';
import {SurvivalCurve, SurvivalPoint} from 'app/models/survival-analysis/survival-curves'
import { colorRange } from '../gb-survival-res/gb-survival.component';
import { summaryTable } from 'app/models/survival-analysis/summaryTable';


@Component({
  selector: 'app-gb-chart-container',
  templateUrl: './gb-chart-container.component.html',
  styleUrls: ['./gb-chart-container.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GbChartContainerComponent implements OnInit {




  _curves:SurvivalCurve
  _groupButton=new Map<string,Selection<SVGCircleElement, unknown, HTMLElement, any>>()
  _hiding=new Map<string,boolean>()
  _colorSet:ScaleOrdinal<string,string>
  _svg:Selection<SVGGElement, unknown, HTMLElement, any>
  _div:Selection<HTMLDivElement, unknown, HTMLElement, any>
  _xaxis:ScaleLinear<number, number>
  _yaxis:ScaleLinear<number, number>
  _margins:number
  _height:number
  _width:number
  _rectHeight:number
  _rectWidth: number

  _lineGen :Line<{
    timePoint: number;
    prob: number;
    cumul: number;
    remaining: number;
}>

_areaGen :Area<{
  timePoint: number;
  prob: number;
  cumul: number;
  remaining: number;
}>
  _legendxPos:number
  _legendyPos:number
  _legendRadius:number
  _legendInterval:number
  _survivalTable:number
  _ticks: Array<number>
  _nofTicks :number
  _hGrid:Selection<SVGGElement, unknown, HTMLElement, any>
  _tableHGrid:Selection<SVGGElement, unknown, HTMLElement, any>
  _summaryDisplay
  _summaryData= new Array<Selection<BaseType, unknown, SVGGElement, unknown>>()
  


  _grid=false


  _selectedInterval:  (sigma:number, point:{timePoint:number,prob:number,cumul:number,remaining:number})=>{inf:number,sup:number}

  _alpha=1.960
 

  constructor() { }

  ngOnInit() {

    if(this._curves){
      this._curves.curves.forEach((curve)=> this._hiding.set(curve.groupId,false))
      //this._ticks=this.tickRange(this.nofTicks)
      this.buildLineChart()
      
    }
  }

  @Input()
  set grid(val:boolean){
    this._grid=val
    this.toggleGrid()
  }

  get grid():boolean{
    return this._grid
  }

  @Input()
  set selectedInterval(interval){
    this._selectedInterval=interval
    if(this._svg){
      this.changeIntervals()
    }
  }

  get selectedInterval(){
    return this._selectedInterval
  }

  @Input()
  set alpha(num:number){
    this._alpha=num
    if(this._svg){
      this.changeIntervals()
    }
  }

  get alpha():number{
    return (this._alpha)
  }

  @Input()
  set curves(cur:SurvivalCurve){
    this._curves=cur
  }

  @Input()
  set nofTicks(n:number){
    this._nofTicks=n
    this.changeGrid()
    
  }

  get nofTicks():number{
    return this._nofTicks
  }

  changeGrid(){
    
    if(this._hGrid){
      this._hGrid.call(axisBottom(this._xaxis).ticks(this._nofTicks))
      var ticks= new Array<number>()
      this._hGrid.selectAll(".tick").each(d=>ticks.push(d as number))
      this._ticks=ticks
    }
    var xaxis
    var yaxis
    if(this._tableHGrid){
      var rightDomainPadding=Math.floor(this.findMaxDomain()/(2*this._ticks.length))
      var lefttDomainPadding=Math.floor(this.findMaxDomain()/(2*this._ticks.length))
      xaxis= scaleLinear().domain([-lefttDomainPadding,this.findMaxDomain()+rightDomainPadding]).range([2*this._margins,this._width-2*this._margins])
      yaxis= scaleBand().domain(this._curves.curves.map(curve=>curve.groupId)).range([this._height,this._survivalTable+100])
      var abscissa=axisBottom(xaxis).tickValues(this._ticks)
      this._tableHGrid.call(abscissa)
    }

    if(this._summaryDisplay){
      this._summaryDisplay.remove()
      this._summaryDisplay=this._svg.append("g")

      this._curves.curves.forEach((curve,i)=>{
        if(this._summaryData.length !=0){
        this._summaryData[i]=this._summaryDisplay.append("g").selectAll("text")
        var summary=summaryTable(curve.points,this._ticks)
        this._summaryData[i]
        .data(summary)
        .enter()
        .append("text")
        .attr("x",(_,i)=>xaxis(this._ticks[i]))
        .attr("y",yaxis(curve.groupId))
        .text(d=> d.atRisk.toString() +"("+ d.event.toString() +")")
        .attr("font-size","15px")
        .attr("transform", `translate(${4*this._margins},${1*this._margins})`)
        .style("text-anchor","middle")
        }
        

      })
    }
    this.toggleGrid()

  }

  toggleGrid(){
    if(this._svg){
      this._svg.select("#hGrid").remove()
      this._svg.select("#vGrid").remove()
      this._svg.select("#summHGrid").remove()
    }
    
    if(this._grid){

      
      this._svg.append("g").attr("transform",`translate(${2*this._margins},${this._survivalTable-this._margins})`)
        .attr("id","hGrid")
        .attr("style","opacity:0.2")
        .call(axisBottom(this._xaxis)
        .tickValues(this._ticks)
        .tickSize(-(this._survivalTable))
        .tickFormat(()=>""))


        

      this._svg.append("g").attr("transform",`translate(${2*this._margins},${-1*this._margins})`)
        .attr("id","vGrid")
        .attr("style","opacity:0.2")
        .call(axisLeft(this._yaxis)
        .ticks(10)
        .tickSize(-this._width)
        .tickFormat(()=>""))
        var domainPadding=this.findMaxDomain()/(2*this._ticks.length)
      
        var xaxis= scaleLinear().domain([-domainPadding,this.findMaxDomain()+domainPadding]).range([2*this._margins,this._width-2*this._margins])

      this._svg.append("g").attr("transform",`translate(${4*this._margins},${this._height-2*this._margins})`)
        .attr("id","summHGrid")
        .attr("style","opacity:0.2")
        .call(axisBottom(xaxis).tickValues(this._ticks)
        .tickSize(-(this._height - this._survivalTable - 100))
        .tickFormat(()=>""))
          
      }
  }

  changeIntervals()
  {
    this.drawCurves()
  }


  buildLineChart(){
    this._width = 600
    this._height=600
    this._margins=10

    this._legendxPos= (this._width-this._curves.curves.length)/2.0 - 30
    this._legendyPos= -20
    this._legendRadius=5
    this._legendInterval=60
    this._survivalTable=400
    this._rectHeight=6
    this._rectWidth=2
    select("svg").remove()
    this._svg=select('#gb-chart-container-component').append("svg").attr("width","100%")
    .attr("height","100%")
    .attr("font-size","20px")
    .attr("viewBox","-10 -20 650 650")
    .append("g").attr("transform",`translate (${this._margins},${this._margins})`)

    this._svg.append("text").attr("text","+")

    this._div =select("#gb-chart-container-component").append("div")
    .style("position","absolute")
    .style("opacity",0.0)
    .style("z-index",10)
    .attr("class","tooltip")
    .html("Hello")


    this._xaxis=scaleLinear().domain([0,this.findMaxDomain()]).range([0,this._width-this._margins])
    this._yaxis=scaleLinear().domain([0,1]).range([this._survivalTable,0])

    this._hGrid=this._svg.append("g")
    .attr("transform",`translate(${2*this._margins},${this._survivalTable-this._margins})`)
    .call(axisBottom(this._xaxis).ticks(this._nofTicks))
    .attr("font-size","15px")
    
    //this is tricky, but it works
    var ticks= new Array<number>()
    this._hGrid.selectAll(".tick").each(d=>ticks.push(d as number))
    this._ticks=ticks

    this._svg.append("g")
    .attr("transform", `translate(${2*this._margins},${-1*this._margins})`)
    .call(axisLeft(this._yaxis))
    .attr("font-size","15px")


    this._colorSet=scaleOrdinal<string,string>().domain(this._curves.curves.map(c=>c.groupId)).range(colorRange)




    this.buildTable()


   

    this._lineGen=line<{timePoint:number,prob:number,cumul:number,remaining:number}>()
    .x(d=>this._xaxis(d.timePoint))
    .y(d=>this._yaxis(d.prob))
    .curve(curveStepAfter)

    
    


  // view title
    this._curves.curves.forEach((curve =>{
      this._groupButton.set(curve.groupId,this.toggleStyle(curve.groupId,
        this._svg.append("circle")

        .attr("cx",this._legendxPos)
        .attr("cy",this._legendyPos)
        .attr("r",this._legendRadius)
        .on("mousedown",(()=>{
          this._hiding.set(curve.groupId, !this._hiding.get(curve.groupId));
          this.toggleStyle(curve.groupId,this._groupButton.get(curve.groupId));
          this.drawCurves();
        }).bind(this))
        )
      )
      

      this._svg.append("text")
      .attr("x",this._legendxPos+7)
      .attr("y",this._legendyPos + 5)
      .text(curve.groupId)
      this._legendxPos+=this._legendInterval

    }).bind(this))
    this.drawCurves()
  }

  drawCurves(){
    var previous=select("#resultDrawing")
    if(previous){
      previous.remove()
    }
    var curvePerSe =this._svg.append("g").attr("id","resultDrawing")
    if (this._selectedInterval){
      this._areaGen=area<{timePoint:number,prob:number,cumul:number,remaining:number}>()
      .x(d=>this._xaxis(d.timePoint))
      .y0(d=>this._yaxis(this._selectedInterval(this._alpha,d).inf))
      .y1(d=>this._yaxis(this._selectedInterval(this._alpha,d).sup) )
      .curve(curveStepAfter)
    }
    this._curves.curves.filter(curve => ! this._hiding.get(curve.groupId)).forEach(curve =>{
      curvePerSe.append("g").selectAll("dot")
      .data(curve.points)
      .enter()
      .filter(d=>d.nofCensorings>0)
      .append("rect")
      .attr("x",d=>this._xaxis(d.timePoint) -this._rectWidth/2)
      .attr("y",d=>this._yaxis(d.prob)-this._rectHeight/2)
      .attr("transform",`translate(${2*this._margins},${-1*this._margins})`)
      .attr("width",this._rectWidth)
      .attr("height",this._rectHeight)
      .style("fill",this._colorSet(curve.groupId))

      if (this._selectedInterval){
      curvePerSe.append("path").datum(curve.points)
        .attr("stroke",this._colorSet(curve.groupId))
        .attr("fill",this._colorSet(curve.groupId))
        .attr("opacity","0.3")
        .attr("transform",`translate(${2*this._margins},${-1*this._margins})`)
        .attr("d",this._areaGen)
      }



      curvePerSe.append("path").datum(curve.points).attr("fill","none")
      .attr("stroke",this._colorSet(curve.groupId)).attr("stroke-width",1)
      .attr("transform",`translate(${2*this._margins},${-1*this._margins})`)
      .attr("d",this._lineGen)

      curvePerSe.append("g").selectAll("dot")
      .data(curve.points)
      .enter()
      .append("circle")
      .attr("cx",d=>this._xaxis(d.timePoint))
      .attr("cy",d=>this._yaxis(d.prob))
      .attr("transform",`translate(${2*this._margins},${-1*this._margins})`)
      .attr("r","3px")
      .attr("opacity",0.0)
      .attr("fill","black").on("mouseover",(d)=>{
                    this._div.transition().style("display","block")
                    this._div.transition().duration(100).style("opacity",1.0)
      .style("top",(event.layerY+20) +"px")
      .style("left",event.layerX +"px");
      this._div.html(generateTooltipHtml(d))})
      .on("mouseout",(()=>{this._div.transition().duration(100).style("opacity",0.0)
                           this._div.transition().delay(100).style("display","none")}).bind(this))
      
      

      
    })
  }

  findMaxDomain():number{
    var timePoints= this._curves.curves.map(curve =>Math.max(... curve.points.map(point=>point.timePoint)))
    return Math.max( ...timePoints)
  }
  toggleStyle(id:string,button : Selection<SVGCircleElement, unknown, HTMLElement, any>):Selection<SVGCircleElement, unknown, HTMLElement, any>{
    if (this._hiding.get(id)){
        button.attr("fill","white")        
      }else{
        button.attr("fill",this._colorSet(id))
      }
      button.attr("stroke",this._colorSet(id))
      return button
  }

  buildTable(){
    var domainPadding=this.findMaxDomain()/(2*this._ticks.length)
    var xaxis= scaleLinear().domain([-domainPadding,this.findMaxDomain()+domainPadding]).range([2*this._margins,this._width-2*this._margins])
    var abscissa=axisBottom(xaxis).tickValues(this._ticks)
    var yaxis= scaleBand().domain(this._curves.curves.map(curve=>curve.groupId)).range([this._height,this._survivalTable+100])
    this._svg.append("g")
    .attr("transform", `translate(${6*this._margins},${-2*this._margins})`)
    .call(axisLeft(yaxis))
    .attr("font-size","15px")

 
    
    this._tableHGrid=this._svg.append("g")
    .attr("transform", `translate(${4*this._margins},${this._height-2*this._margins})`)
    .call(abscissa)
    .attr("font-size","15px")
    this._summaryDisplay=this._svg.append("g")
    
    this._curves.curves.forEach((curve,i)=>{
      var summary=summaryTable(curve.points,this._ticks)
      this._summaryData.push(this._summaryDisplay.append("g").selectAll("text"))
      this._summaryData[i]
      .data(summary)
      .enter()
      .append("text")
      .attr("x",(_,i)=>xaxis(this._ticks[i]))
      .attr("y",yaxis(curve.groupId))
      .text(d=> d.atRisk.toString() +"("+ d.event.toString() +")")
      .attr("font-size","15px")
      .attr("transform", `translate(${4*this._margins},${1*this._margins})`)
      .style("text-anchor","middle")

    })
  }

  tickRange(ticks:number):Array<number>{
    var max=Math.floor(this.findMaxDomain()/ticks)*ticks
    return range(0,max+0.5,Math.floor(this.findMaxDomain()/ticks))
  }
}

function generateTooltipHtml(point : SurvivalPoint):string{
  var res=""
  res +="<p>Time point " +point.timePoint.toString()+"<br>\n"
  res +="At risk "+point.atRisk.toString()+"<br>\n"
  res +="Events "+point.cumulEvents.toString()+"<br>\n"
  res+="Censoring "+point.cumulCensorings.toString()+"</p>\n"

  return res
}