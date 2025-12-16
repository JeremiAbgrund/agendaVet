import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { of } from 'rxjs';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      providers: [
        { provide: AppointmentsService, useValue: { list: () => [] } },
        { provide: ProfileService, useValue: { getProfile: () => ({ ownerName: 'Mock', vets: [] }), ready: Promise.resolve(true) } },
        { provide: ApiService, useValue: { fetchTips: () => of([]) } },
        { provide: Storage, useValue: { create: () => Promise.resolve({ get: async () => null, set: async () => {}, remove: async () => {}, clear: async () => {} }) } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
