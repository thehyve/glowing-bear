import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication/authentication.service';

@Component({
  selector: 'gb-fractalis',
  templateUrl: './gb-fractalis.component.html',
  styleUrls: ['./gb-fractalis.component.css']
})
export class GbFractalisComponent implements OnInit {

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit() {
    // const config = {
    //   handler: 'transmart',
    //   dataSource: 'http://localhost:8081/v2',
    //   fractalisNode: 'http://localhost:80',
    //   getAuth() {
    //     return {token: this.authService.token}
    //   },
    //   options: {
    //     controlPanelPosition: 'right',
    //     controlPanelExpanded: true
    //   }
    // };
    // console.log('token: ', this.authService.token)
    // console.log('config: ', config)
    // let fjs = fractalis.init(config);
    // // const fjs = init(config);
    // console.log('fjs', fjs)
  }

}
