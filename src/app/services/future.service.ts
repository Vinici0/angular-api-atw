import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FutureService {

  url:string = 'http://localhost:9090/v1/breweries/random?size=20';

  urlMongo:string = 'http://localhost:9001/mongo/beers';

  constructor(
    private http: HttpClient
  ) { }

  public doGet(url: string) {

    return this.http.get(url);
  }

  public doPost(url: string, data:  any) {
    console.log("url", url, "data", data);

    return this.http.post(url, data);
  }
}
