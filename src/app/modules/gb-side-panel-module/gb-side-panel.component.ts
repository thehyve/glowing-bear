import {Component, OnInit} from '@angular/core';
import {NavbarService} from '../../services/navbar.service';

@Component({
  selector: 'gb-side-panel',
  templateUrl: './gb-side-panel.component.html',
  styleUrls: ['./gb-side-panel.component.css']
})
export class GbSidePanelComponent implements OnInit {

  constructor(private navbarService: NavbarService) {
  }

  ngOnInit() {
  }

  get isDataSelection(): boolean {
    return this.navbarService.isDataSelection;
  }
}
