import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, signal, ViewChild, type OnInit } from '@angular/core';
import { Lugares } from '../interfaces/lugares.';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { OperatorFunction, Observable, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxCurrencyDirective } from 'ngx-currency';

@Component({
  selector: 'app-crear-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgbTypeaheadModule
  ],
  templateUrl: './crearLista.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearListaComponent implements OnInit {
  @ViewChild('precioUnitario') elprecio: ElementRef | undefined;
  lugares: Lugares[] = [];
  lugarcito: any = '';
  fecha: Date = new Date();
  formalista: any;
  lugarSeleccionado = signal({ id: '', lugar: '' });
  modo = inject(NgbModal);
  dbser = inject(NgxIndexedDBService);
  fb = inject(FormBuilder);
  cambios = inject(ChangeDetectorRef);
  totalvan: number = 0;
  metiendo: number = 0;
  cantidad: number = 1;
  lalista = signal([{ cantidad: 0, precio: 0, subtotal: 0 }]);
  async ngOnInit(): Promise<void> {
    this.dbser.getAll('lugares').subscribe(
      {
        next: (res: any) => {
          this.lugares = res;
          console.log(res);
        },
        error: (err: any) => {
          console.log("ERROR: ", err);
        },
        complete: () => { }
      }
    )
    this.formalista = this.fb.group({
      lista: [],
      fecha: [this.fecha],
      lugar: [0, Validators.required],
      total: [0, Validators.required]
    })
  }
  formatoLug = (luguito: Lugares) => luguito.lugar;
  buscarLugar: OperatorFunction<string, readonly Lugares[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter((term) =>
        term.length >= 2
      ),
      map((term) =>
        this.lugares.filter((lugar: Lugares) =>
          new RegExp(term.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'gi')
            .test(lugar.lugar.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
        )
          .slice(0, 10)
      )
    );
  seleccionaLugar(este: any) {
    console.log(typeof (este));
    if (typeof (este) == 'string') {
      console.log(este);
      this.dbser.add('lugares', { lugar: este }).subscribe({
        next: (res: any) => {
          console.log("Meti ", res)
          this.formalista.controls.lugar.setValue(res.id)
          this.lugarSeleccionado.set(res);
          this.dbser.getAll('lugares').subscribe(
            {
              next: (res: any) => {
                this.lugares = res;
                this.lugarcito = '';
                this.cambios.detectChanges();
              },
              error: (err: any) => {
                console.log("ERROR: ", err);
              },
              complete: () => { }
            }
          )

        },
        error: (err) => {
          console.warn(err);
        },
        complete: () => { }
      });
    } else {
      this.formalista.controls.lugar.setValue(este.id)
      this.lugarcito = '';
      this.lugarSeleccionado.set(este);
    }
  }
  calcularTotal() {
    var van = this.cantidad * this.metiendo;
    this.lalista().map((it: any) => {
      console.log(it.subtotal);
      van += it.subtotal
    })
    this.totalvan = van;

  }
  meterEnLaLista() {
    var seva = {
      precio: this.metiendo,
      cantidad: this.cantidad,
      subtotal: this.metiendo * this.cantidad
    }
    this.cantidad = 1;
    this.metiendo = 0;
    this.lalista().push(seva);
    this.elprecio?.nativeElement.focus();
  }
}
