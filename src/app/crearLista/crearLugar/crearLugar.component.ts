import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-crear-lugar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './crearLugar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearLugarComponent implements OnInit {

  ngOnInit(): void { }

}
