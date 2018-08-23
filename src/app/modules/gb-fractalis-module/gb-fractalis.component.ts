import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication/authentication.service';
// import * as fjs from '../../../../node_modules/fractalis/lib/fractal-1.2.2-test-1.min.js';
import * as fjs from 'fractalis';

@Component({
  selector: 'gb-fractalis',
  templateUrl: './gb-fractalis.component.html',
  styleUrls: ['./gb-fractalis.component.css']
})
export class GbFractalisComponent implements OnInit {
  fractal: any;

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit() {
    // TODO: current fractalis testing version does not suport export
    // TODO: need to add it manually in node_modules
    // TODO: in future, expect an update from fractalis
    const config = {
      handler: 'transmart',
      dataSource: 'http://localhost:8081/v2',
      fractalisNode: 'http://localhost:80',
      getAuth() {
        return {token: this.authService.token}
      },
      options: {
        controlPanelPosition: 'right',
        controlPanelExpanded: true
      }
    };
    this.fractal = fjs.fractal.init(config);
    console.log('fractal', this.fractal)
  }

}
