import { jsPDF } from 'jspdf'
import { Selection } from 'd3'


export class PDF {
  _jsPDF: jsPDF
  constructor() {
    this._jsPDF = new jsPDF()
  }
  /*
  addSVG(svg:Selection<SVGGElement, unknown, HTMLElement, any>,x : number, y :number, w:number,h:number,
    compression:boolean=false,rotation:number=0 ){
      this._jsPDF.addSvgAsImage(svg,x,y,w,h,'',compression,rotation)
  }
  export(name:string){
      this._jsPDF.save(name)

  }
  */

}
