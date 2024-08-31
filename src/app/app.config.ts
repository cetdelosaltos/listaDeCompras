import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';

const compradb: DBConfig = {
  name: 'MarMorCompras',
  version: 1,
  objectStoresMeta: [
    {
      store: 'compras',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'lista', keypath: 'lista', options: { unique: false } },
        { name: 'fecha', keypath: 'fecha', options: { unique: false } },
        { name: 'lugar', keypath: 'lugar', options: { unique: false } },
        { name: 'total', keypath: 'total', options: { unique: false } }
      ]
    },
    {
      store: 'lugares',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'lugar', keypath: 'lugar', options: { unique: false } },
      ]
    },
  ]
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      NgxIndexedDBModule.forRoot(compradb)
    )
  ]
};
