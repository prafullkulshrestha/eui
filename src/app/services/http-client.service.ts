import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import jsCookie from 'js-cookie';

@Injectable()
export class HttpClientService {

  constructor(private http: Http) {}

  private createAuthorizationHeader(): Headers {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("X-CSRF-Token", jsCookie.get('csrf-token'));
    return headers;
  }

  private requestMethods(){
    let options = new RequestOptions({
      headers: this.createAuthorizationHeader(),
      withCredentials: true
    });
    return options;
  }


  private onError(error) {
    console.log(error);
    if(error.status == 401){ // redirect to login
        window.location.replace("/id?redirect=" + encodeURIComponent(window.location.pathname + window.location.hash));
    }
    throw error;
  }

  // http get request
  get(url) {
    let options = this.requestMethods();
    return this.http.get(url, options)
                .toPromise()
                .catch((error) => this.onError(error));
  }

  // http post request
  post(url, data) {
    let options = this.requestMethods();
    return this.http.post(url, data, options)
                .toPromise()
                .catch((error) => this.onError(error));
  }

  // http post request
  delete(url) {
    let options = this.requestMethods();
    return this.http.delete(url, options)
                .toPromise()
                .catch((error) => this.onError(error));
  }
}
