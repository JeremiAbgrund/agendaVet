import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarCitasPage } from './gestionar-citas.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarCitasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarCitasPageRoutingModule {}
