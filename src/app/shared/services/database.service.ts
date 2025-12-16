import { Injectable, Optional } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppointmentItem } from '../models/appointment.model';
import { PetProfile, UserProfile } from '../models/profile.model';
import { SupportRequest } from '../models/support-request.model';

// Interface para el modelo de datos de usuario de autenticación
export interface User {
  id?: number;
  email: string;
  password_hash: string; // Almacenar un hash, no la clave en texto plano
}

// --- DATOS DE SIEMBRA ---
const SEED_APPOINTMENTS: Omit<AppointmentItem, 'id'>[] = [
  { petName: 'Luna', ownerName: 'Jeremi Riquelme', type: 'Vacuna anual', date: 'Martes 12 Nov', time: '11:30', vet: 'Dra. Camila Herrera', notes: 'Llegar 10 min antes', status: 'confirmada', favorite: true },
  { petName: 'Milo', ownerName: 'Jeremi Riquelme', type: 'Control dental', date: 'Jueves 14 Nov', time: '15:00', vet: 'Dr. Ortega', status: 'pendiente', favorite: false },
];
const DEFAULT_PETS: PetProfile[] = [
  { id: 'pet-1', name: 'Luna', species: 'gato', breed: 'Siamesa', birthdate: '2021-03-18', favorite: true },
  { id: 'pet-2', name: 'Milo', species: 'perro', breed: 'Border Collie', birthdate: '2020-09-05', favorite: false }
];
const DEFAULT_PROFILE: Omit<UserProfile, 'pets'> = {
  ownerName: 'Jeremi Riquelme',
  email: 'jeremi@agendavet.cl',
  phone: '+56 9 1111 2222',
  clinic: 'Clinica Patitas Felices',
  notifications: { email: true, sms: false, push: true },
  vets: [ { id: 'vet-1', name: 'Dra. Camila Herrera', specialty: 'Medicina general', available: true } ]
};
const DEMO_USER: User = { email: 'demo@agendavet.cl', password_hash: 'ClaveDemo1' };

// --- Claves para Web Storage ---
const USERS_KEY = 'db_users';
const APPOINTMENTS_KEY = 'db_appointments';
const PETS_KEY = 'db_pets';
const PROFILE_KEY = 'db_profile';
const SUPPORT_KEY = 'db_support';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private useSQLite: boolean;
  private dbObject?: SQLiteObject;
  private webStorage!: Storage;
  private readonly dbName = 'agendavet.db';
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform,
    private storage: Storage,
    // Hacer opcional la inyección de SQLite para facilitar tests en entornos sin plugin nativo
    @Optional() private sqlite?: SQLite,
  ) {
    // Usar SQLite solo si la plataforma indica Capacitor y el plugin está disponible
    this.useSQLite = this.platform.is('capacitor') && !!this.sqlite;
    // Solicitar ready solo si la plataforma está definida
    this.platform.ready().then(() => this.init());
  }

  private async init(): Promise<void> {
    try {
      if (this.useSQLite && this.sqlite) {
        // Crear y preparar la base de datos SQLite si el plugin está disponible
        this.dbObject = await this.sqlite.create({ name: this.dbName, location: 'default' });
        await this.createTables();
      } else {
        // Usar Ionic Storage como respaldo para entornos web/testing
        if (this.storage) {
          this.webStorage = await this.storage.create();
        } else {
          // Proveer un storage mínimo en memoria para permitir tests sin dependencia nativa
          const inMemory = new Map<string, any>();
          this.webStorage = {
            get: async (k: string) => inMemory.get(k),
            set: async (k: string, v: any) => { inMemory.set(k, v); return v; },
            remove: async (k: string) => { inMemory.delete(k); },
            clear: async () => { inMemory.clear(); }
          } as unknown as Storage;
        }
      }
      await this.seedDatabase();
      this.isDbReady.next(true);
      console.log(`Database initialized successfully (using ${this.useSQLite ? 'SQLite' : 'Web Storage'}).`);
    } catch (e) {
      console.error('Error initializing database', e);
    }
  }

  // --- Lógica de Creación y Siembra ---

  private async createTables(): Promise<void> {
    if (!this.useSQLite || !this.dbObject) return;
    // La creación de tablas solo es necesaria para SQLite
    const queries = [
      `CREATE TABLE IF NOT EXISTS appointments (id TEXT PRIMARY KEY, petName TEXT, ownerName TEXT, type TEXT, date TEXT, time TEXT, vet TEXT, notes TEXT, status TEXT, favorite INTEGER)`,
      `CREATE TABLE IF NOT EXISTS pets (id TEXT PRIMARY KEY, name TEXT, species TEXT, breed TEXT, birthdate TEXT, favorite INTEGER)`,
      `CREATE TABLE IF NOT EXISTS support_requests (id TEXT PRIMARY KEY, fullName TEXT, email TEXT, phone TEXT, topic TEXT, message TEXT, preferredChannel TEXT, createdAt TEXT)`,
      `CREATE TABLE IF NOT EXISTS user_profile (id INTEGER PRIMARY KEY DEFAULT 1, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password_hash TEXT)`
    ];
    for (const query of queries) {
      await this.dbObject.executeSql(query, []);
    }
  }

  private async seedDatabase(): Promise<void> {
    if (this.useSQLite) {
      await this.seedSQLite();
    } else {
      await this.seedWebStorage();
    }
  }

  private async seedSQLite(): Promise<void> {
    if (!this.dbObject) return;
    try {
      const appCount = (await this.dbObject.executeSql('SELECT COUNT(*) as count FROM appointments', [])).rows.item(0).count;
      if (appCount === 0) {
        for (const app of SEED_APPOINTMENTS) {
          await this.addAppointment({ ...app, id: `cita-${Date.now()}-${Math.floor(Math.random() * 999)}` });
        }
      }
      const profileCount = (await this.dbObject.executeSql('SELECT COUNT(*) as count FROM user_profile', [])).rows.item(0).count;
      if (profileCount === 0) {
        await this.saveUserProfileData(DEFAULT_PROFILE);
        for (const pet of DEFAULT_PETS) {
          await this.upsertPet(pet);
        }
      }
      const demoUserCount = (await this.dbObject.executeSql('SELECT COUNT(*) as count FROM users WHERE email = ?', [DEMO_USER.email])).rows.item(0).count;
      if (demoUserCount === 0) {
        await this.addUser(DEMO_USER);
      }
    } catch (e) { console.error('Error seeding SQLite', e); }
  }

  private async seedWebStorage(): Promise<void> {
    try {
      const users = await this.webStorage.get(USERS_KEY);
      if (!users || users.length === 0) {
        await this.webStorage.set(USERS_KEY, [DEMO_USER]);
      }
      const appointments = await this.webStorage.get(APPOINTMENTS_KEY);
      if (!appointments) {
        await this.webStorage.set(APPOINTMENTS_KEY, SEED_APPOINTMENTS.map(a => ({...a, id: `cita-${Date.now()}-${Math.floor(Math.random() * 999)}` })));
      }
      const profile = await this.webStorage.get(PROFILE_KEY);
      if (!profile) {
        await this.webStorage.set(PROFILE_KEY, DEFAULT_PROFILE);
      }
      const pets = await this.webStorage.get(PETS_KEY);
      if (!pets) {
        await this.webStorage.set(PETS_KEY, DEFAULT_PETS);
      }
    } catch (e) { console.error('Error seeding Web Storage', e); }
  }

  getDatabaseState(): Observable<boolean> {
    return this.isDbReady.asObservable();
  }

  // --- Métodos CRUD --- //

  // --- Usuario ---
  // Añadir un usuario en el almacenamiento adecuado (SQLite o Web Storage)
  async addUser(user: Omit<User, 'id'>): Promise<any> {
    if (this.useSQLite) {
      const { email, password_hash } = user;
      return this.dbObject!.executeSql('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, password_hash]);
    }
    const users = (await this.webStorage.get(USERS_KEY) || []);
    users.push(user);
    return this.webStorage.set(USERS_KEY, users);
  }

  // Obtener un usuario por correo (comparar en minúsculas y sin espacios)
  async getUserByEmail(email: string): Promise<User | null> {
    const normalized = email.toString().trim().toLowerCase();
    if (this.useSQLite) {
      const res = await this.dbObject!.executeSql('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [normalized]);
      return res.rows.length > 0 ? res.rows.item(0) as User : null;
    }
    const users = (await this.webStorage.get(USERS_KEY) || []);
    return users.find((u: User) => (u.email ?? '').toLowerCase() === normalized) || null;
  }

  // --- Citas ---
  async getAppointments(): Promise<AppointmentItem[]> {
    if (this.useSQLite) {
      const res = await this.dbObject!.executeSql('SELECT * FROM appointments ORDER BY date DESC', []);
      const appointments: AppointmentItem[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        const item = res.rows.item(i);
        appointments.push({ ...item, favorite: Boolean(item.favorite) });
      }
      return appointments;
    }
    return (await this.webStorage.get(APPOINTMENTS_KEY) || []);
  }

  async addAppointment(item: AppointmentItem): Promise<any> {
    if (this.useSQLite) {
      const { id, petName, ownerName, type, date, time, vet, notes, status, favorite } = item;
      return this.dbObject!.executeSql('INSERT INTO appointments (id, petName, ownerName, type, date, time, vet, notes, status, favorite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, petName, ownerName, type, date, time, vet, notes, status, favorite ? 1 : 0]);
    }
    const appointments = await this.getAppointments();
    appointments.unshift(item);
    return this.webStorage.set(APPOINTMENTS_KEY, appointments);
  }

  async getAppointmentById(id: string): Promise<AppointmentItem | undefined> {
    if (this.useSQLite) {
      const res = await this.dbObject!.executeSql('SELECT * FROM appointments WHERE id = ?', [id]);
      if (res.rows.length > 0) {
        const item = res.rows.item(0);
        return { ...item, favorite: Boolean(item.favorite) };
      }
      return undefined;
    }
    const appointments = await this.getAppointments();
    return appointments.find(a => a.id === id);
  }

  async updateAppointment(item: Partial<AppointmentItem> & { id: string }): Promise<any> {
    if (this.useSQLite) {
      const setClauses = Object.keys(item).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
      const values = Object.values(item).filter(v => typeof v !== 'string' || v !== item.id);
      values.push(item.id);
      const sql = `UPDATE appointments SET ${setClauses} WHERE id = ?`;
      return this.dbObject!.executeSql(sql, values);
    }
    const appointments = await this.getAppointments();
    const index = appointments.findIndex(a => a.id === item.id);
    if (index > -1) {
      appointments[index] = { ...appointments[index], ...item };
    }
    return this.webStorage.set(APPOINTMENTS_KEY, appointments);
  }

  async deleteAppointment(id: string): Promise<any> {
    if (this.useSQLite) {
      return this.dbObject!.executeSql('DELETE FROM appointments WHERE id = ?', [id]);
    }
    let appointments = await this.getAppointments();
    appointments = appointments.filter(a => a.id !== id);
    return this.webStorage.set(APPOINTMENTS_KEY, appointments);
  }
  
  // --- Perfil y Mascotas ---
  async getFullUserProfile(): Promise<UserProfile> {
    if (this.useSQLite) {
      const profileData = await this.getUserProfileData();
      const pets = await this.getPets();
      return { ...profileData, pets };
    }
    const profile = await this.webStorage.get(PROFILE_KEY) || DEFAULT_PROFILE;
    const pets = await this.webStorage.get(PETS_KEY) || [];
    return { ...profile, pets };
  }

  async saveFullUserProfile(profile: UserProfile): Promise<any> {
    if (this.useSQLite) {
      const { pets, ...profileData } = profile;
      const promises = [this.saveUserProfileData(profileData), ...pets.map(pet => this.upsertPet(pet))];
      return Promise.all(promises);
    }
    const { pets, ...profileData } = profile;
    await this.webStorage.set(PETS_KEY, pets);
    return this.webStorage.set(PROFILE_KEY, profileData);
  }

  private async getPets(): Promise<PetProfile[]> {
    if (this.useSQLite) {
        const res = await this.dbObject!.executeSql('SELECT * FROM pets', []);
        const pets: PetProfile[] = [];
        for (let i = 0; i < res.rows.length; i++) {
            const item = res.rows.item(i);
            pets.push({ ...item, favorite: Boolean(item.favorite) });
        }
        return pets;
    }
    return this.webStorage.get(PETS_KEY) || [];
  }

  private async upsertPet(pet: PetProfile): Promise<any> {
    if (this.useSQLite) {
        const { id, name, species, breed, birthdate, favorite } = pet;
        return this.dbObject!.executeSql('INSERT OR REPLACE INTO pets (id, name, species, breed, birthdate, favorite) VALUES (?, ?, ?, ?, ?, ?)', [id, name, species, breed, birthdate, favorite ? 1 : 0]);
    }
    const pets = await this.getPets();
    const index = pets.findIndex(p => p.id === pet.id);
    if (index > -1) {
        pets[index] = pet;
    } else {
        pets.push(pet);
    }
    return this.webStorage.set(PETS_KEY, pets);
  }

  async deletePet(id: string): Promise<any> {
    if (this.useSQLite) {
        return this.dbObject!.executeSql('DELETE FROM pets WHERE id = ?', [id]);
    }
    let pets = await this.getPets();
    pets = pets.filter(p => p.id !== id);
    return this.webStorage.set(PETS_KEY, pets);
  }

  private async getUserProfileData(): Promise<Omit<UserProfile, 'pets'>> {
    if (this.useSQLite) {
      const res = await this.dbObject!.executeSql('SELECT data FROM user_profile WHERE id = 1', []);
      return res.rows.length > 0 ? JSON.parse(res.rows.item(0).data) : DEFAULT_PROFILE;
    }
    return this.webStorage.get(PROFILE_KEY) || DEFAULT_PROFILE;
  }

  private async saveUserProfileData(profileData: Omit<UserProfile, 'pets'>): Promise<any> {
    if (this.useSQLite) {
      const data = JSON.stringify(profileData);
      return this.dbObject!.executeSql('INSERT OR REPLACE INTO user_profile (id, data) VALUES (1, ?)', [data]);
    }
    return this.webStorage.set(PROFILE_KEY, profileData);
  }

  // --- Solicitudes de Soporte ---
  async getSupportRequests(): Promise<SupportRequest[]> {
    if (this.useSQLite) {
      const res = await this.dbObject!.executeSql('SELECT * FROM support_requests ORDER BY createdAt DESC', []);
      const requests: SupportRequest[] = [];
      for (let i = 0; i < res.rows.length; i++) {
          requests.push(res.rows.item(i));
      }
      return requests;
    }
    return (await this.webStorage.get(SUPPORT_KEY) || []);
  }

  async addSupportRequest(req: SupportRequest): Promise<any> {
    if (this.useSQLite) {
      const { id, fullName, email, phone, topic, message, preferredChannel, createdAt } = req;
      return this.dbObject!.executeSql('INSERT INTO support_requests (id, fullName, email, phone, topic, message, preferredChannel, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, fullName, email, phone, topic, message, preferredChannel, createdAt]);
    }
    const requests = await this.getSupportRequests();
    requests.unshift(req);
    return this.webStorage.set(SUPPORT_KEY, requests);
  }
}
