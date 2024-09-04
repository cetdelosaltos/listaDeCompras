import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { Listas } from '../../interfaces/listas.';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-eliminar-lista',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './eliminarLista.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EliminarListaComponent implements OnInit {
  dbserv = inject(NgxIndexedDBService);
  abridor = inject(NgbActiveOffcanvas);
  paborrar: any;
  ngOnInit(): void { }
  eliminarDefinitivamente(paborrar: Listas) {
    this.dbserv.delete('compras', paborrar.id).subscribe({
      next: (res: any) => {
        console.log(res)
        this.abridor.dismiss('eliminado');
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {

      }
    })
  }
}
