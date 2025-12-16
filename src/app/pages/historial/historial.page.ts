import { Component, OnInit } from '@angular/core';
import { SupportRequest } from 'src/app/shared/models/support-request.model';
import { SupportService } from 'src/app/shared/services/support.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false,
})
export class HistorialPage implements OnInit {

  requests: SupportRequest[] = [];
  filteredRequests: SupportRequest[] = [];
  topics = ['todos', 'agendamiento', 'facturacion', 'tecnico', 'sugerencia'] as const;
  selectedTopic: typeof this.topics[number] = 'todos';

  constructor(private supportService: SupportService) {}

  async ngOnInit() {
    await this.supportService.ready;
    await this.loadRequests();
  }

  async loadRequests(): Promise<void> {
    this.requests = await this.supportService.getHistory();
    this.applyFilter();
  }

  async doRefresh(event: CustomEvent): Promise<void> {
    await this.loadRequests();
    setTimeout(() => {
      event.detail.complete();
    }, 600);
  }

  selectTopic(topic: typeof this.topics[number]): void {
    this.selectedTopic = topic;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredRequests = this.requests.filter(req => this.selectedTopic === 'todos' || req.topic === this.selectedTopic);
  }

}
