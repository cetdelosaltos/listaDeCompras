import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgbModule
  ],
  templateUrl: './inicio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioComponent implements OnInit {
  dbserv = inject(NgxIndexedDBService);
  listas = signal([]);
  async ngOnInit(): Promise<void> {
    this.traerListas();
  }
  async traerListas() {
    await this.dbserv.getAll('compras').subscribe(
      {
        next: (list: any) => {
          console.log(list);
          this.listas.set(list);
        },
        error: (err) => {
          console.log(err)
        },
        complete: () => {

        }
      }
    )
  }
  async meterLista() {
    await this.dbserv.add('compras', {
      lista: "[{1,2,3,4}",
      fecha: "25/08/2024",
      lugar: "En el Plaza",
      total: "250"
    }).subscribe({
      next: (res) => { console.log(res) },
      error: (err) => { console.error(err) },
      complete: () => { (console.log('Lo IUntente')) }
    });
  }
}
