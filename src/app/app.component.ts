import { Component } from '@angular/core';
import { DatabaseService } from './shared/services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private databaseService: DatabaseService) {
    console.log('AppComponent constructor: DatabaseService injected to initialize.');
  }
}
