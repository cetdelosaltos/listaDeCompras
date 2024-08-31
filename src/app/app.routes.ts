import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { CrearListaComponent } from './crearLista/crearLista.component';


export const routes: Routes = [
    {
        path: "",
        component: CrearListaComponent,
        pathMatch: 'full'
    },
    {
        path: "listas",
        component: InicioComponent
    },
    {
        path: '*', redirectTo: ''
    },
    {
        path: '**', redirectTo: ''
    }
];
