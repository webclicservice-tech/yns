import { Project, ProjectStatus, Role, Unit, User, StockItem, PurchaseOrder } from '../types';

// Clés de stockage pour la base de données locale
const DB_KEYS = {
  USERS: 'mg_db_users_v1',
  PROJECTS: 'mg_db_projects_v1',
  STOCK: 'mg_db_stock_v1',
  ORDERS: 'mg_db_orders_v2' // V2 for structure change
};

// Données initiales (Seed) pour la première exécution
const SEED_USERS: User[] = [
  { id: 'u1', name: 'Younes', email: 'younes@menuiserie.ma', phone: '0661000001', role: Role.Admin, password: '123' },
  { id: 'u2', name: 'Youssef (Commercial)', email: 'youssef@menuiserie.ma', phone: '0661000002', role: Role.Commercial, password: '123' },
  { id: 'u3', name: 'Hamid (Atelier)', email: 'hamid@menuiserie.ma', phone: '0661000003', role: Role.Atelier, password: '123' },
  { id: 'u4', name: 'Karim (Livraison)', email: 'karim@menuiserie.ma', phone: '0661000004', role: Role.Livraison, password: '123' },
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'p1',
    clientName: 'Amina El Fassi',
    orderNumber: 'BC-2025-0142',
    phone: '+212 6 12 34 56 78',
    address: 'Lotissement Al Andalous, Meknès',
    gps: { lat: 33.8932, lng: -5.5473 },
    type: 'Habillage murale',
    responsibleId: 'u2',
    status: ProjectStatus.InProduction,
    createdAt: '2025-11-28',
    estimatedDeadline: '2025-12-16',
    notes: 'Vérifier teinte LED avant fixation',
    measurements: [
      { id: 'm1', room: 'Salon', width: 420, height: 280, depth: 35, unit: Unit.CM },
      { id: 'm2', room: 'Niche TV', width: 180, height: 120, depth: 40, unit: Unit.CM },
    ],
    attachments: [
      { id: 'a1', type: 'design_pdf', filename: 'amina_salon_plan_v2.pdf', url: '#', uploadedBy: 'u2', date: '2025-11-29' }
    ],
    tasks: [
      { id: 't1', title: 'Découpe panneaux', status: 'in_progress', progress: 60, assignee: 'u3' },
      { id: 't2', title: 'Placage et ponçage', status: 'todo', progress: 0 },
      { id: 't3', title: 'Assemblage éléments', status: 'blocked', progress: 0 },
    ],
    history: [
      { id: 'h1', from: ProjectStatus.Draft, to: ProjectStatus.PendingReview, date: '2025-11-28 10:15', user: 'Youssef' },
      { id: 'h2', from: ProjectStatus.PendingReview, to: ProjectStatus.ValidatedBC, date: '2025-11-28 16:40', user: 'Younes', comment: 'BC signé par client' },
      { id: 'h3', from: ProjectStatus.ValidatedBC, to: ProjectStatus.Estimated, date: '2025-11-29 09:00', user: 'Younes' },
      { id: 'h4', from: ProjectStatus.Estimated, to: ProjectStatus.SentToWorkshop, date: '2025-11-30 11:00', user: 'Younes' },
      { id: 'h5', from: ProjectStatus.SentToWorkshop, to: ProjectStatus.InProduction, date: '2025-12-01 08:30', user: 'Hamid' },
    ],
    delivery: {
        proposedDate: '2025-12-20'
    }
  },
  {
    id: 'p2',
    clientName: 'Rachid Benali',
    orderNumber: 'BC-2025-0179',
    phone: '+212 6 98 76 54 32',
    address: 'Route Sidi Kacem, Meknès',
    gps: { lat: 34.0171, lng: -5.0347 },
    type: 'Dressing',
    responsibleId: 'u2',
    status: ProjectStatus.DeliveryPlanned,
    createdAt: '2025-12-02',
    estimatedDeadline: '2025-12-15',
    notes: 'Prévoir protection sols lors installation',
    measurements: [
      { id: 'm3', room: 'Chambre parentale', width: 260, height: 250, depth: 60, unit: Unit.CM },
    ],
    attachments: [
        { id: 'a2', type: 'design_pdf', filename: 'atlas_dressing_v1.pdf', url: '#', uploadedBy: 'u2', date: '2025-12-02' }
    ],
    tasks: [],
    history: [
       { id: 'h6', from: ProjectStatus.Finished, to: ProjectStatus.DeliveryPlanned, date: '2025-12-16 10:00', user: 'Hamid' }
    ],
    delivery: {
        proposedDate: '2025-12-19',
        validatedDate: '2025-12-19',
        validatedBy: 'u2',
        clientNotified: true
    }
  },
  {
    id: 'p3',
    clientName: 'Dr. Tazi',
    orderNumber: 'BC-2025-0188',
    phone: '+212 6 61 00 00 00',
    address: 'Centre Ville, Fès',
    type: 'Bureau complet',
    responsibleId: 'u2',
    status: ProjectStatus.Draft,
    createdAt: '2025-12-10',
    measurements: [],
    attachments: [],
    tasks: [],
    history: []
  },
  {
      id: 'p4',
      clientName: 'Mme. Bennani',
      orderNumber: 'BC-2025-0190',
      phone: '+212 6 62 11 22 33',
      address: 'Agdal, Rabat',
      type: 'Cuisine',
      responsibleId: 'u1',
      status: ProjectStatus.QualityControl,
      createdAt: '2025-11-15',
      estimatedDeadline: '2025-12-12', // Late!
      measurements: [],
      attachments: [],
      tasks: [
          {id: 't4', title: 'Finitions vernis', status: 'in_progress', progress: 80, assignee: 'u3'}
      ],
      history: []
  }
];

const SEED_STOCK: StockItem[] = [
    { id: 's1', name: 'MDF 18mm (Panneau)', category: 'Panneaux', quantity: 45, unit: 'pcs', minThreshold: 10, location: 'Zone A' },
    { id: 's2', name: 'MDF 6mm (Fond)', category: 'Panneaux', quantity: 8, unit: 'pcs', minThreshold: 15, location: 'Zone A' },
    { id: 's3', name: 'Charnières invisibles', category: 'Quincaillerie', quantity: 120, unit: 'pcs', minThreshold: 50, location: 'Tiroir 4' },
    { id: 's4', name: 'Coulisses Tiroir 45cm', category: 'Quincaillerie', quantity: 12, unit: 'paires', minThreshold: 20, location: 'Tiroir 6' },
    { id: 's5', name: 'Vernis Mat', category: 'Finition', quantity: 5, unit: 'L', minThreshold: 10, location: 'Zone Chimie' },
    { id: 's6', name: 'Colle à bois D3', category: 'Consommable', quantity: 2, unit: 'Kg', minThreshold: 5, location: 'Établi' },
];

const SEED_ORDERS: PurchaseOrder[] = [
    { 
        id: 'po1', 
        items: [{ itemName: 'Coulisses Tiroir 45cm', quantity: 50, unit: 'paires' }], 
        status: 'ordered', 
        dateCreated: '2025-12-14', 
        requestedBy: 'Hamid', 
        supplier: 'Quincaillerie Pro', 
        supplierAddress: 'Zone Industrielle, Meknès' 
    },
    { 
        id: 'po2', 
        items: [{ itemName: 'Vis 4x30mm', quantity: 1000, unit: 'pcs' }], 
        status: 'pending', 
        dateCreated: '2025-12-15', 
        requestedBy: 'Hamid' 
    },
];

// --- Fonctions internes du service de base de données ---

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) {
            // Initialisation si vide
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        }
        return JSON.parse(stored);
    } catch (e) {
        console.error(`Erreur de lecture DB pour ${key}`, e);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Erreur d'écriture DB pour ${key}`, e);
    }
};

// --- API Publique du Service ---

// PROJETS
export const getProjects = (): Promise<Project[]> => {
    const projects = loadFromStorage<Project[]>(DB_KEYS.PROJECTS, SEED_PROJECTS);
    return Promise.resolve(projects);
};

export const getProjectById = (id: string): Promise<Project | undefined> => {
    const projects = loadFromStorage<Project[]>(DB_KEYS.PROJECTS, SEED_PROJECTS);
    return Promise.resolve(projects.find(p => p.id === id));
};

export const createProject = (projectData: Partial<Project>, creator: User): Promise<Project> => {
    const projects = loadFromStorage<Project[]>(DB_KEYS.PROJECTS, SEED_PROJECTS);
    
    const newProject: Project = {
        id: `p${Date.now()}`, // ID unique basé sur timestamp
        clientName: projectData.clientName || '',
        orderNumber: projectData.orderNumber || '',
        phone: projectData.phone || '',
        address: projectData.address || '',
        type: projectData.type || 'Autre',
        responsibleId: creator.id,
        status: ProjectStatus.Draft,
        createdAt: new Date().toISOString().split('T')[0],
        estimatedDeadline: projectData.estimatedDeadline,
        notes: projectData.notes,
        measurements: [],
        attachments: [],
        tasks: [],
        history: [{
            id: `h${Date.now()}`,
            from: ProjectStatus.Draft,
            to: ProjectStatus.Draft,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            user: creator.name,
            comment: 'Création du projet'
        }],
        ...projectData
    } as Project;

    projects.push(newProject);
    saveToStorage(DB_KEYS.PROJECTS, projects);
    return Promise.resolve(newProject);
};

export const saveProject = (project: Project): Promise<Project> => {
    const projects = loadFromStorage<Project[]>(DB_KEYS.PROJECTS, SEED_PROJECTS);
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
        projects[index] = project;
        saveToStorage(DB_KEYS.PROJECTS, projects);
        return Promise.resolve(project);
    }
    return Promise.reject("Projet non trouvé");
}


// UTILISATEURS
export const getUsers = (): Promise<User[]> => {
    const users = loadFromStorage<User[]>(DB_KEYS.USERS, SEED_USERS);
    return Promise.resolve(users);
};

export const createUser = (userData: Omit<User, 'id'>): Promise<User> => {
    const users = loadFromStorage<User[]>(DB_KEYS.USERS, SEED_USERS);
    const newUser: User = {
        id: `u${Date.now()}`,
        ...userData
    };
    users.push(newUser);
    saveToStorage(DB_KEYS.USERS, users);
    return Promise.resolve(newUser);
};

export const updateUser = (user: User): Promise<User> => {
    const users = loadFromStorage<User[]>(DB_KEYS.USERS, SEED_USERS);
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
        saveToStorage(DB_KEYS.USERS, users);
        return Promise.resolve(user);
    }
    return Promise.reject("Utilisateur introuvable");
};

export const deleteUser = (userId: string): Promise<boolean> => {
    let users = loadFromStorage<User[]>(DB_KEYS.USERS, SEED_USERS);
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    
    if (users.length !== initialLength) {
        saveToStorage(DB_KEYS.USERS, users);
        return Promise.resolve(true);
    }
    return Promise.reject("Utilisateur introuvable");
};

// STOCK
export const getStock = (): Promise<StockItem[]> => {
    const stock = loadFromStorage<StockItem[]>(DB_KEYS.STOCK, SEED_STOCK);
    return Promise.resolve(stock);
};

export const updateStockItem = (item: StockItem): Promise<StockItem> => {
    const stock = loadFromStorage<StockItem[]>(DB_KEYS.STOCK, SEED_STOCK);
    const index = stock.findIndex(s => s.id === item.id);
    if (index !== -1) {
        stock[index] = item;
    } else {
        stock.push(item);
    }
    saveToStorage(DB_KEYS.STOCK, stock);
    return Promise.resolve(item);
};

export const getPurchaseOrders = (): Promise<PurchaseOrder[]> => {
    const orders = loadFromStorage<PurchaseOrder[]>(DB_KEYS.ORDERS, SEED_ORDERS);
    return Promise.resolve(orders);
};

export const createPurchaseOrder = (order: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const orders = loadFromStorage<PurchaseOrder[]>(DB_KEYS.ORDERS, SEED_ORDERS);
    const newOrder: PurchaseOrder = {
        id: `po${Date.now()}`,
        items: order.items || [], // Array of items
        status: 'pending',
        dateCreated: new Date().toISOString().split('T')[0],
        requestedBy: order.requestedBy || 'Admin',
        supplierAddress: order.supplierAddress,
        supplier: order.supplier,
        ...order
    };
    orders.push(newOrder);
    saveToStorage(DB_KEYS.ORDERS, orders);
    return Promise.resolve(newOrder);
};

export const updatePurchaseOrder = (order: PurchaseOrder): Promise<PurchaseOrder> => {
    const orders = loadFromStorage<PurchaseOrder[]>(DB_KEYS.ORDERS, SEED_ORDERS);
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
        orders[index] = order;
        saveToStorage(DB_KEYS.ORDERS, orders);
        return Promise.resolve(order);
    }
    return Promise.reject("Commande non trouvée");
};

export const MOCK_USERS = loadFromStorage<User[]>(DB_KEYS.USERS, SEED_USERS);