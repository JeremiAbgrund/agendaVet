import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarCitasPageRoutingModule } from './gestionar-citas-routing.module';

import { GestionarCitasPage } from './gestionar-citas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionarCitasPageRoutingModule
  ],
  declarations: [GestionarCitasPage]
})
export class GestionarCitasPageModule {}
