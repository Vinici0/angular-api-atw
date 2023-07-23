import { Component } from '@angular/core';
import { FutureService } from 'src/app/services/future.service';

@Component({
  selector: 'app-future',
  templateUrl: './future.component.html',
  styleUrls: ['./future.component.css']
})
export class FutureComponent {

  public listaData: any = [];
  constructor(
    private futureService: FutureService
  ) { }

  ngOnInit(): void {
    this.getData();
  }


  getData() {
    this.futureService.doGet(this.futureService.url).subscribe((data: any) => {
      this.listaData = data;
    });
  }

  addDetail(data: any) {
    console.log("data", data);

    this.futureService.doPost(this.futureService.urlMongo, data).subscribe((response: any) => {
      console.log("response", response);
    }
    );
  }
}
