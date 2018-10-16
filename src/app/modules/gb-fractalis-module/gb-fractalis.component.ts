import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import * as fjs from 'fractalis';
import {MessageHelper} from '../../utilities/message-helper';

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
    console.log('token: ', this.authService.token);
    let token = this.authService.token;
    const config = {
      handler: 'transmart',
      dataSource: 'http://10.18.35.175:8081',
      fractalisNode: 'http://localhost',
      getAuth() {
        return {token: token}
      },
      options: {
        controlPanelPosition: 'right',
        controlPanelExpanded: true
      }
    };
    let constraint1 = {
      type: 'and',
      args: [
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'concept',
            conceptCode: 'O1KP:NUM1'
          }
        },
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'study_name',
            studyId: 'ORACLE_1000_PATIENT'
          }
        }
      ]
    };
    let constraint2 = {
      type: 'concept',
      conceptCode: 'O1KP:NUM1'
    }
    let descriptor = {
      constraint: JSON.stringify(constraint2),
      data_type: 'numerical',
      label: 'second test'
    };

    if (fjs.fractalis) {
      this.fractal = fjs.fractalis.init(config);
      console.log('Fratalis imported: ', this.fractal);
      this.fractal.loadData([descriptor])
        .then(res => {
          console.log('response here', res)
        })
        .catch(err => {
          console.log('cannot load data: ', err);
        })
    } else {
      MessageHelper.alert('error', 'Fail to import Fractalis.');
    }
  }

}
