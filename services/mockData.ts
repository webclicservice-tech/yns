import { Project, ProjectStatus, Role, Unit, User } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sana (Admin)', email: 'sana@menuiserie.ma', role: Role.Admin },
  { id: 'u2', name: 'Youssef (Commercial)', email: 'youssef@menuiserie.ma', role: Role.Commercial },
  { id: 'u3', name: 'Hamid (Atelier)', email: 'hamid@menuiserie.ma', role: Role.Atelier },
  { id: 'u4', name: 'Karim (Livraison)', email: 'karim@menuiserie.ma', role: Role.Livraison },
];

export const MOCK_PROJECTS: Project[] = [
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
      { id: 'h2', from: ProjectStatus.PendingReview, to: ProjectStatus.ValidatedBC, date: '2025-11-28 16:40', user: 'Sana', comment: 'BC signé par client' },
      { id: 'h3', from: ProjectStatus.ValidatedBC, to: ProjectStatus.Estimated, date: '2025-11-29 09:00', user: 'Sana' },
      { id: 'h4', from: ProjectStatus.Estimated, to: ProjectStatus.SentToWorkshop, date: '2025-11-30 11:00', user: 'Sana' },
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
    responsibleId: 'u2', // Samira replacement
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

export const getProjects = () => Promise.resolve(MOCK_PROJECTS);
export const getProjectById = (id: string) => Promise.resolve(MOCK_PROJECTS.find(p => p.id === id));

export const createProject = (projectData: Partial<Project>, creator: User) => {
    const newProject: Project = {
        id: `p${MOCK_PROJECTS.length + 1}`,
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

    MOCK_PROJECTS.push(newProject);
    return Promise.resolve(newProject);
};

export const getUsers = () => Promise.resolve(MOCK_USERS);

export const createUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
        id: `u${MOCK_USERS.length + 1}`,
        ...userData
    };
    MOCK_USERS.push(newUser);
    return Promise.resolve(newUser);
};

export const updateUser = (user: User) => {
    const index = MOCK_USERS.findIndex(u => u.id === user.id);
    if (index !== -1) {
        MOCK_USERS[index] = user;
        return Promise.resolve(user);
    }
    return Promise.reject("Utilisateur introuvable");
};

export const deleteUser = (userId: string) => {
    const index = MOCK_USERS.findIndex(u => u.id === userId);
    if (index !== -1) {
        MOCK_USERS.splice(index, 1);
        return Promise.resolve(true);
    }
    return Promise.reject("Utilisateur introuvable");
};
