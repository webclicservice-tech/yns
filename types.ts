export enum Role {
  Admin = 'Admin',
  Commercial = 'Commercial',
  Atelier = 'Atelier',
  Livraison = 'Livraison',
}

export enum ProjectStatus {
  Draft = 'Brouillon',
  PendingReview = 'En attente contrôle BC',
  ValidatedBC = 'BC validé',
  Estimated = 'Délai estimé',
  SentToWorkshop = 'Envoyé à l’atelier',
  InProduction = 'En production',
  QualityControl = 'Contrôle qualité',
  Finished = 'Produit terminé',
  DeliveryPlanned = 'Livraison planifiée',
  DeliveryDateValidated = 'Date livraison validée',
  Delivered = 'Livré (à valider)',
  Validated = 'Validé (clôturé)',
  Returned = 'Retourné avec observations',
}

export enum Unit {
  MM = 'mm',
  CM = 'cm',
  M = 'm',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
}

export interface Measurement {
  id: string;
  room: string;
  width: number;
  height: number;
  depth?: number;
  unit: Unit;
}

export interface Attachment {
  id: string;
  type: 'photo' | 'design_pdf' | 'delivery_proof' | 'note_attachment' | 'other';
  filename: string;
  url: string;
  uploadedBy: string;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  assignee?: string;
  progress: number;
}

export interface WorkflowEvent {
  id: string;
  from: ProjectStatus;
  to: ProjectStatus;
  date: string;
  user: string;
  comment?: string;
}

export interface Project {
  id: string;
  clientName: string;
  orderNumber: string; // BC
  phone: string;
  address: string;
  gps?: { lat: number; lng: number };
  type: string;
  responsibleId: string;
  status: ProjectStatus;
  createdAt: string;
  estimatedDeadline?: string;
  measurements: Measurement[];
  attachments: Attachment[];
  tasks: Task[];
  history: WorkflowEvent[];
  notes?: string;
  delivery?: {
    proposedDate?: string;
    validatedDate?: string;
    validatedBy?: string;
    clientNotified?: boolean;
  };
}

export interface StockItem {
  id: string;
  name: string;
  category: 'Panneaux' | 'Quincaillerie' | 'Finition' | 'Consommable' | 'Autre';
  quantity: number;
  unit: string;
  minThreshold: number; // Seuil d'alerte
  location?: string;
}

export interface PurchaseOrderItem {
  itemName: string;
  quantity: number;
  unit?: string;
}

export interface PurchaseOrder {
  id: string;
  items: PurchaseOrderItem[];
  supplier?: string;
  supplierAddress?: string;
  status: 'pending' | 'ordered' | 'received';
  dateCreated: string;
  dateReceived?: string;
  requestedBy: string;
}