import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { ContactoPage } from './contacto.page';
import { Storage } from '@ionic/storage-angular';
describe('ContactoPage', () => {
  let component: ContactoPage;
  let fixture: ComponentFixture<ContactoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactoPage],
      imports: [ReactiveFormsModule, IonicModule.forRoot(), MatFormFieldModule, MatSelectModule, MatInputModule, MatSlideToggleModule, MatExpansionModule],
      providers: [
        { provide: Storage, useValue: { create: () => Promise.resolve({ get: async () => null, set: async () => {}, remove: async () => {}, clear: async () => {} }) } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
