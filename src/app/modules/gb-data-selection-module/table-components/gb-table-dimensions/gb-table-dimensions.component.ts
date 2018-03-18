import {Component, OnInit} from '@angular/core';
import {Dimension} from '../../../../models/dimension';

@Component({
  selector: 'gb-table-dimensions',
  templateUrl: './gb-table-dimensions.component.html',
  styleUrls: ['./gb-table-dimensions.component.css']
})
export class GbTableDimensionsComponent implements OnInit {

  public candidates: Dimension[];
  public rows: Dimension[];
  public cols: Dimension[];

  constructor() {
  }

  ngOnInit() {
    this.rows = [];
    this.candidates = [];
    this.candidates.push(new Dimension('d1'));
    this.candidates.push(new Dimension('d2'));
  }

}
