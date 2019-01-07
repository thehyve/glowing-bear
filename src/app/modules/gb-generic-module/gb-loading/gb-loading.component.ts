import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'gb-loading',
  templateUrl: './gb-loading.component.html',
  styleUrls: ['./gb-loading.component.css']
})
export class GbLoadingComponent implements OnInit {
  @Input() loading: boolean;

  constructor() {
  }

  ngOnInit() {
    this.loading = this.loading === undefined ? true : this.loading;
  }

}
