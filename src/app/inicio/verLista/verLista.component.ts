import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { Listas } from '../../interfaces/listas.';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ver-lista',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './verLista.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerListaComponent implements OnInit {
  lista: any = {};
  abrido = inject(NgbActiveModal)
  ngOnInit(): void {
    console.log(this.lista)
  }

}
