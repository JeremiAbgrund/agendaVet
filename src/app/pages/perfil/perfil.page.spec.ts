import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilPage } from './perfil.page';

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfilPage],
      imports: [ReactiveFormsModule, IonicModule.forRoot()],
      providers: [
        { provide: ProfileService, useValue: { getProfile: () => ({ ownerName: 'Mock', vets: [] }) } },
        { provide: Storage, useValue: { create: () => Promise.resolve({ get: async () => null, set: async () => {}, remove: async () => {}, clear: async () => {} }) } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
