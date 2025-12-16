import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { NuevaCitaPage } from './nueva-cita.page';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { Storage } from '@ionic/storage-angular';
import { of } from 'rxjs';

describe('NuevaCitaPage', () => {
  let component: NuevaCitaPage;
  let fixture: ComponentFixture<NuevaCitaPage>;

  const appointmentsServiceStub = {
    createAppointment: jasmine.createSpy('createAppointment').and.returnValue({
      id: 'mock',
      petName: 'Luna',
      ownerName: 'Jeremi',
      type: 'Control',
      date: '2025-11-12',
      time: '10:00',
      vet: 'Dr. Demo',
      status: 'pendiente',
      notes: ''
    })
  };

  const profileServiceStub = {
    getProfile: () => ({
      ownerName: 'Jeremi Riquelme',
      vets: [{ id: 'v1', name: 'Dr. Demo', specialty: 'General', available: true }]
    })
  };

  const toastControllerStub = {
    create: jasmine.createSpy('create').and.resolveTo({
      present: () => Promise.resolve()
    })
  };

  const navControllerStub = {
    navigateBack: jasmine.createSpy('navigateBack')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaCitaPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: AppointmentsService, useValue: appointmentsServiceStub },
        { provide: ProfileService, useValue: profileServiceStub },
        { provide: ToastController, useValue: toastControllerStub },
        { provide: NavController, useValue: navControllerStub },
        { provide: Storage, useValue: { create: () => Promise.resolve({ get: async () => null, set: async () => {}, remove: async () => {}, clear: async () => {} }) } },
        { provide: ApiService, useValue: { fetchVets: () => of([]), fetchTips: () => of([]) } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaCitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
