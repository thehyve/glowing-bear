import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";

@Injectable()
export class ConfigService {
  private _config: Object;
  private _env: Object;

  constructor(private http: Http) {
  }
  load() {
    // json files will be loaded here
    let path = 'src/app/modules/shared/services/config/';
    return new Promise((resolve, reject) => {
      this.http.get(path+'env.json')
      .map(res => res.json())
        .subscribe((env_data) => {
          this._env = env_data;
          this.http.get(path + env_data.env + '.json')
          .map(res => res.json())
            .catch((error: any) => {
              console.error(error);
              return Observable.throw(error.json().error || 'Server error');
            })
            .subscribe((data) => {
              this._config = data; console.log('config loaded: ', this._config);
              resolve(true);
            });
        });
    });
  }
  getEnv(key: any) {
    return this._env[key];
  }
  get(key: any) {
    return this._config[key];
  }
};
