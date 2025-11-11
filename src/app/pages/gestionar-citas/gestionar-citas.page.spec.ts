import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { GestionarCitasPage } from './gestionar-citas.page';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';

describe('GestionarCitasPage', () => {
  let component: GestionarCitasPage;
  let fixture: ComponentFixture<GestionarCitasPage>;

  const appointmentsServiceStub = {
    list: jasmine.createSpy('list').and.returnValue([]),
    updateAppointment: jasmine.createSpy('updateAppointment'),
    deleteAppointment: jasmine.createSpy('deleteAppointment')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GestionarCitasPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AppointmentsService, useValue: appointmentsServiceStub },
        ToastController,
        AlertController
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarCitasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
