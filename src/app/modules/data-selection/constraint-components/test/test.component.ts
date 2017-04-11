import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @Input() type: string = "success";
  @Output() output = new EventEmitter

  constructor() { }

  ngOnInit() {
  }

}
