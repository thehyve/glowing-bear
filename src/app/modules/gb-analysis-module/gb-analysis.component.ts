import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gb-analysis',
  templateUrl: './gb-analysis.component.html',
  styleUrls: ['./gb-analysis.component.css']
})
export class GbAnalysisComponent implements OnInit {

  constructor() { }

  draggingmode(event){
    event.preventDefault()
  }

  ngOnInit() {
  }

}
