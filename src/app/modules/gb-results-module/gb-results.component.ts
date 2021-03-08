import {Component} from "@angular/core";
import {NavbarService} from "../../services/navbar.service";

@Component({
  selector: 'gb-results',
  templateUrl: './gb-results.component.html',
  styleUrls: ['./gb-results.component.css']
})
export class GbResultsComponent{

  constructor(public navbarService: NavbarService
  ) {
  }


}

