export interface SupportRequest {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  topic: 'agendamiento' | 'facturacion' | 'tecnico' | 'sugerencia';
  message: string;
  preferredChannel: 'email' | 'telefono';
  createdAt: string;
}
