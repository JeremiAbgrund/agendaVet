import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ListadoPage } from './listado.page';

describe('ListadoPage', () => {
  let component: ListadoPage;
  let fixture: ComponentFixture<ListadoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListadoPage],
      providers: [
        { provide: AppointmentsService, useValue: { list: () => [] } },
        { provide: Storage, useValue: { create: () => Promise.resolve({ get: async () => null, set: async () => {}, remove: async () => {}, clear: async () => {} }) } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
