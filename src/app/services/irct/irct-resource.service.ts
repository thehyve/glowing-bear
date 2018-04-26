import {Injectable, OnInit} from '@angular/core';
import {IRCTResourceDef} from '../../models/irct-models/irct-resource-definition';
import {IRCTEndPointService} from './irct-endpoint.service';
import {AppConfig} from '../../config/app.config';

@Injectable()
export class IRCTResourceService implements OnInit {

  /**
   * Contains the IRCT resource currently used by Glowing Bear.
   */
  private _currentResource: IRCTResourceDef;

  /**
   * List of resources declared by the backend.
   */
  private _resources: IRCTResourceDef[];

  constructor(private endpointService: IRCTEndPointService,
              private config: AppConfig) {
  }

  ngOnInit(): void {
    this.loadResource(this.config.getConfig('irct-resource-name'));
  }

  // public

  // ------------------- private helpers ----------------------

  private loadResource(resourceName: string) {
    this.endpointService.getIRCTResources().subscribe(
      (resources: IRCTResourceDef[]) => {

        // get all resources
        this._resources = resources;
        console.log(`Loaded IRCT resources: ${resources.map((a) => a.name).join(', ')}`);

        // find current resource
        this._currentResource = this._resources.find((res) =>
          res.name === resourceName
        );

        if (this._currentResource === undefined) {
          throw new Error('Configured resource does not exist');
        } else {
          console.log(`Configured resource is ${this._currentResource.name}`)
        }
      }
    );
  }

  // ------------------- getters/setter ----------------------
  get resources(): IRCTResourceDef[] {
    return this._resources;
  }

  get currentResource(): IRCTResourceDef {
    return this._currentResource;
  }
}


