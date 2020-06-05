import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-gb-subgroup',
  templateUrl: './gb-subgroup.component.html',
  styleUrls: ['./gb-subgroup.component.css']
})
export class GbSubgroupComponent implements OnInit {

  _activated=false

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set activated(val:boolean){
    this._activated=val
  }

  
  get activated():boolean{
    return this._activated
  }

  @Output()
  activatedChange=new EventEmitter<boolean>();

  close(){
    this._activated=false
    this.activatedChange.emit(false)
  }
}
