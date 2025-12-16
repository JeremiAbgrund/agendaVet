// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import { IonicModule } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/shared/services/api.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

// First, initialize the Angular testing environment.
const testBed = getTestBed();
testBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Configure global testing modules and providers to avoid repeated setup in individual specs
testBed.configureTestingModule({
  imports: [IonicModule.forRoot(), HttpClientTestingModule, CommonModule, NoopAnimationsModule, MatChipsModule, MatIconModule],
  providers: [
    // Proveer un stub minimal para SQLite (evitar error de provider en tests unitarios)
    { provide: SQLite, useValue: {} },
    // Proveer un stub funcional para Storage (Ionic Storage)
    { provide: Storage, useValue: { create: () => Promise.resolve({ get: async (k: string) => null, set: async (k: string, v: any) => v, remove: async (k: string) => {}, clear: async () => {} }) } },
    // Proveer un stub para ApiService para evitar depender de HttpClient en tests que no lo requieran
    { provide: ApiService, useValue: { fetchVets: () => of([]), fetchTips: () => of([]) } }
  ]
});
