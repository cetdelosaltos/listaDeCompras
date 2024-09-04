import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDatepickerModule, NgbDateStructAdapter, NgbModal, NgbModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Listas } from '../interfaces/listas.';
import { VerListaComponent } from './verLista/verLista.component';
import { EliminarListaComponent } from './eliminarLista/eliminarLista.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    NgbDatepickerModule
  ],
  templateUrl: './inicio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
  	.dp-hidden {
			width: 0;
			margin: 0;
			border: none;
			padding: 0;
		}
		.custom-day {
			text-align: center;
			padding: 0.185rem 0.25rem;
			display: inline-block;
			height: 2rem;
			width: 2rem;
		}
		.custom-day.focused {
			background-color: var(--bs-primary);
		}
		.custom-day.range,
		.custom-day:hover {
			background-color: rgb(0, 64, 64);
			color: white;
		}
		.custom-day.faded {
			background-color: rgba(0, 128, 128, 0.5);
		}

    `
})

export class InicioComponent implements OnInit {
  dbserv = inject(NgxIndexedDBService);
  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);
  abridor = inject(NgbOffcanvas);
  modito = inject(NgbModal);
  fechador = inject(NgbDateAdapter);
  paborrar: any;
  elmes: number = 0;
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 10);
  private cambio = inject(ChangeDetectorRef);
  listas = signal([{
    id: 0,
    fecha: '',
    total: 0,
    lugar: { lugar: '', id: 0 }
  }]);
  listasMaster: Listas[] = [];
  async ngOnInit(): Promise<void> {
    this.traerListas();
  }
  async traerListas() {
    await this.dbserv.getAll('compras').subscribe(
      {
        next: (list: any) => {
          this.listas.set([]);
          this.listasMaster = [];
          var ampliada = list.map((lis: Listas) => {
            var fechita = new Date(lis.fecha).getMonth() + 1;
            if (fechita == this.fromDate?.month) {
              this.elmes += lis.total
            }
            this.dbserv.getByKey('lugares', lis.lugar).subscribe({
              next: (res) => {
                lis.lugar = res
                this.cambio.detectChanges();
              }
            }
            )
            return lis;
          })
          var ordenadas = ampliada.sort((a: any, b: any) => {
            if (a.id < b.id) {
              return 1;
            } else {
              return -1;
            }
            return 0;
          })
          this.listas.set(ordenadas);
          this.listasMaster = ordenadas;
          this.cambio.detectChanges();
        },
        error: (err) => {
          console.log(err);
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
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.toDate == null) {
      this.listas.set(this.listasMaster);
    } else {
      var fechados = this.listasMaster.filter((lis: Listas) => {
        var cosito = new Date(lis.fecha);
        const fechita: any = this.fechador.fromModel({ day: cosito.getDate(), month: cosito.getMonth() + 1, year: cosito.getFullYear() });
        console.log("Esta es la ", this.fromDate?.before(fechita));
        if (this.toDate?.equals(fechita)) {
          return lis;
        }
        if (this.fromDate?.equals(fechita)) {
          return lis;
        }
        if (this.toDate?.after(fechita) && this.fromDate?.before(fechita)) {
          return lis;
        }
        return;
      })
      this.listas.set(fechados);
      console.log(fechados);
    }
  }
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }
  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }
  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }
  empezarABorrar(item: any) {
    const elicon = this.abridor.open(EliminarListaComponent, { position: 'bottom' })
    elicon.componentInstance.paborrar = item;
    elicon.dismissed.subscribe((res: any) => {
      if (res == 'eliminado') {
        this.traerListas();
        this.abridor.dismiss();
      }
    })
  }
  filtrarLista(eve: any) {
    var listaFiltrada = this.listasMaster.filter((lis: any) => {
      const hay = new RegExp(eve.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 'gi').test(lis.lugar.lugar.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      if (hay) {
        return lis;
      } else {
        return false;
      }
    })
    this.listas.set(listaFiltrada);
  }
  verLista(lista: Listas) {
    const abrido = this.modito.open(VerListaComponent)
    abrido.componentInstance.lista = lista;
    console.log(lista);
    abrido.dismissed.subscribe((res) => {
      if (res == 'eliminar') {
        this.empezarABorrar(lista);
      }
    })
  }
}
