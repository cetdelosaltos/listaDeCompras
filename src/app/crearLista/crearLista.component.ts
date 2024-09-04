import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, signal, TemplateRef, ViewChild, type OnInit } from '@angular/core';
import { Lugares } from '../interfaces/lugares.';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbOffcanvas, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { OperatorFunction, Observable, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { createMask, InputMaskModule } from '@ngneat/input-mask';

@Component({
  selector: 'app-crear-lista',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    ReactiveFormsModule,
    InputMaskModule,
    FormsModule,
    NgbTypeaheadModule,
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
  lugarSeleccionado = signal({ id: undefined, lugar: undefined });
  modo = inject(NgbModal);
  dbser = inject(NgxIndexedDBService);
  fb = inject(FormBuilder);
  cambios = inject(ChangeDetectorRef);
  abridor = inject(NgbOffcanvas);
  ruta = inject(Router);
  totalvan: number = 0;
  metiendo: number = 0;
  paborrar: any = {};
  cantidad: number = 1;
  grantotal: number = 0;
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
    this.lalista().splice(0, 1);
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
    if (typeof (este) == 'string' && este !== '') {
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
      van += it.subtotal
    })
    this.totalvan = van;

  }
  meterEnLaLista() {
    console.log(this.metiendo);
    if (this.metiendo !== 0 && this.cantidad !== 0) {
      var seva = {
        precio: this.metiendo,
        cantidad: this.cantidad,
        subtotal: this.metiendo * this.cantidad
      }
      this.cantidad = 1;
      this.metiendo = 0;
      this.lalista().push(seva);
      var van = 0;
      this.lalista().map((it: any) => {
        van += it.subtotal
      })
      this.grantotal = van;
      this.elprecio?.nativeElement.focus();
    }
  }
  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: '.',
    digits: 2,
    digitsOptional: false,
    prefix: '$',
    placeholder: '0',
    parser: (viene: string) => {
      var seva = Number(viene.replace(/[^0-9\.-]+/g, ""));
      return seva;
    }
  });
  empezarABorrar(bichito: TemplateRef<any>, item: any, indice: number) {
    this.abridor.open(bichito, { position: 'bottom' })
    this.paborrar = item;
    this.paborrar.indi = indice;
  }
  eliminarDefinitivamente(item: any) {
    this.lalista().splice(item.indi, 1);
    this.abridor.dismiss();
    this.calcularTotal();
  }
  guardarLista() {
    console.log(this.lalista());
    var pameter: any = {
      fecha: this.fecha,
      lugar: this.lugarSeleccionado().id,
      total: this.grantotal,
      lista: this.lalista()
    }
    this.dbser.add('compras', pameter).subscribe({
      next: (res: any) => {
        this.ruta.navigate(['/listas'])
      }
    }
    )
    //fecha fecha
    //lugar lugarseleccionado.id
    //total grantotal
    //lista    lalista

  }
}
