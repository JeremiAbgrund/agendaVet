export interface AppointmentItem {
  id: string;
  petName: string;
  ownerName: string;
  type: string;
  date: string;
  time: string;
  vet: string;
  notes?: string;
  status: 'confirmada' | 'pendiente';
  favorite?: boolean;
  avatar?: string;
  photos?: string[];
  location?: string;
}
