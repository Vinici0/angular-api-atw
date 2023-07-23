import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ApiSpringService {
  constructor(
    private http: HttpClient
  ) {}

  public doPost(url: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(url, data, {headers});
  }

  public doGet(url: string) {
    console.log("url", url);

    return this.http.get(url);
  }

  public doPut(url: string, data: any){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log("url", url, "data", data);
    return this.http.put(url, data, {headers});
  }

  public doDelete(url: string, data: any){
    return this.http.delete(url, data);
  }
}
