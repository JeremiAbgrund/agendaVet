import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportService } from 'src/app/shared/services/support.service';
import { HistorialPage } from './historial.page';

describe('HistorialPage', () => {
  let component: HistorialPage;
  let fixture: ComponentFixture<HistorialPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistorialPage],
      providers: [
        { provide: SupportService, useValue: { list: () => [] } },
        { provide: Storage, useValue: { create: () => Promise.resolve({ get: async () => null, set: async () => {}, remove: async () => {}, clear: async () => {} }) } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
