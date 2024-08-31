import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable({
  providedIn: 'root'
})
export class ListasService {
  constructor(
    private dbser: NgxIndexedDBService
  ) { }
  traerListas() {

  }
  meterLista(viene: any) {
    this.dbser.add('listas', viene);
  }
}
