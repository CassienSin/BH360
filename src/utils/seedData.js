/**
 * Data Seeding Utility
 * Helper functions to populate Firebase with initial data for testing
 */

import { createDocument, COLLECTIONS } from '../services/firebaseService';
import { toast } from 'react-toastify';

/**
 * Sample user profiles (Tanod members)
 */
const sampleTanodUsers = [
  {
    email: 'pedro.santos@barangay.gov.ph',
    displayName: 'Pedro Santos',
    firstName: 'Pedro',
    lastName: 'Santos',
    phone: '+63 912 345 6789',
    role: 'tanod',
    status: 'active',
    currentShift: 'day',
    assignedAreas: ['Purok 1-3', 'Main Road'],
    qualifications: ['First Aid Certified', 'Crisis Management', 'Community Policing'],
    rating: 4.8,
    totalIncidentsResponded: 45,
    totalDutyHours: 1200,
    emergencyContact: {
      name: 'Maria Santos',
      relationship: 'Spouse',
      phone: '+63 912 345 6780',
    },
    address: 'Purok 1, Barangay Hall',
  },
  {
    email: 'maria.garcia@barangay.gov.ph',
    displayName: 'Maria Garcia',
    firstName: 'Maria',
    lastName: 'Garcia',
    phone: '+63 923 456 7890',
    role: 'tanod',
    status: 'active',
    currentShift: 'night',
    assignedAreas: ['Purok 4-6', 'Market Area'],
    qualifications: ['First Aid Certified', 'Traffic Management'],
    rating: 4.9,
    totalIncidentsResponded: 38,
    totalDutyHours: 980,
    emergencyContact: {
      name: 'Juan Garcia',
      relationship: 'Husband',
      phone: '+63 923 456 7891',
    },
    address: 'Purok 4, Barangay Hall',
  },
  {
    email: 'jose.reyes@barangay.gov.ph',
    displayName: 'Jose Reyes',
    firstName: 'Jose',
    lastName: 'Reyes',
    phone: '+63 934 567 8901',
    role: 'tanod',
    status: 'on-leave',
    currentShift: 'off',
    assignedAreas: ['Purok 7-9'],
    qualifications: ['First Aid Certified', 'Disaster Response'],
    rating: 4.7,
    totalIncidentsResponded: 52,
    totalDutyHours: 1450,
    emergencyContact: {
      name: 'Ana Reyes',
      relationship: 'Sister',
      phone: '+63 934 567 8902',
    },
    address: 'Purok 7, Barangay Hall',
  },
  {
    email: 'ana.cruz@barangay.gov.ph',
    displayName: 'Ana Cruz',
    firstName: 'Ana',
    lastName: 'Cruz',
    phone: '+63 945 678 9012',
    role: 'tanod',
    status: 'active',
    currentShift: 'day',
    assignedAreas: ['Purok 10-12'],
    qualifications: ['First Aid Certified', 'Conflict Resolution'],
    rating: 4.6,
    totalIncidentsResponded: 28,
    totalDutyHours: 720,
    emergencyContact: {
      name: 'Carlos Cruz',
      relationship: 'Brother',
      phone: '+63 945 678 9013',
    },
    address: 'Purok 10, Barangay Hall',
  },
];

/**
 * Sample incidents
 */
const sampleIncidents = [
  {
    title: 'Loud music disturbance',
    description: 'Neighbors playing loud music late at night',
    category: 'noise',
    priority: 'minor',
    location: 'Purok 3, Barangay Hall Area',
    reporterName: 'Juan Dela Cruz',
    reporterContact: '+63 912 345 0001',
    status: 'submitted',
  },
  {
    title: 'Broken streetlight',
    description: 'Streetlight not working for 3 days, creating safety hazard',
    category: 'hazard',
    priority: 'urgent',
    location: 'Main Road, Block 5',
    reporterName: 'Maria Santos',
    reporterContact: '+63 923 456 0002',
    status: 'in-progress',
  },
  {
    title: 'Suspicious person',
    description: 'Unknown person lurking around residential area late at night',
    category: 'crime',
    priority: 'urgent',
    location: 'Purok 3, Barangay Hall Area',
    reporterName: 'Pedro Reyes',
    reporterContact: '+63 934 567 0003',
    status: 'in-progress',
  },
  {
    title: 'Property dispute',
    description: 'Neighbors arguing over fence boundary',
    category: 'dispute',
    priority: 'minor',
    location: 'Residential Area, Block 2',
    reporterName: 'Ana Garcia',
    reporterContact: '+63 945 678 0004',
    status: 'resolved',
  },
  {
    title: 'Street fight',
    description: 'Physical altercation between two residents',
    category: 'crime',
    priority: 'emergency',
    location: 'Purok 3, Barangay Hall Area',
    reporterName: 'Carlos Santos',
    reporterContact: '+63 956 789 0005',
    status: 'resolved',
  },
  {
    title: 'Fallen tree blocking road',
    description: 'Large tree fell during storm, blocking main road',
    category: 'hazard',
    priority: 'emergency',
    location: 'Main Road, Block 5',
    reporterName: 'Rosa Cruz',
    reporterContact: '+63 967 890 0006',
    status: 'resolved',
  },
  {
    title: 'Noise complaint - construction',
    description: 'Construction noise early morning disturbing residents',
    category: 'noise',
    priority: 'minor',
    location: 'Residential Area, Block 2',
    reporterName: 'Luis Reyes',
    reporterContact: '+63 978 901 0007',
    status: 'submitted',
  },
  {
    title: 'Theft reported',
    description: 'Motorcycle stolen from parking area',
    category: 'crime',
    priority: 'urgent',
    location: 'Market Area',
    reporterName: 'Elena Garcia',
    reporterContact: '+63 989 012 0008',
    status: 'in-progress',
  },
];

/**
 * Sample schedules
 */
const sampleSchedules = (tanodIds) => [
  {
    tanodId: tanodIds[0],
    tanodName: 'Pedro Santos',
    date: new Date(),
    shift: 'day',
    startTime: '06:00',
    endTime: '18:00',
    patrolArea: 'Purok 1-3',
    status: 'in-progress',
  },
  {
    tanodId: tanodIds[1],
    tanodName: 'Maria Garcia',
    date: new Date(),
    shift: 'night',
    startTime: '18:00',
    endTime: '06:00',
    patrolArea: 'Purok 4-6',
    status: 'scheduled',
  },
  {
    tanodId: tanodIds[3],
    tanodName: 'Ana Cruz',
    date: new Date(Date.now() + 86400000), // Tomorrow
    shift: 'day',
    startTime: '06:00',
    endTime: '18:00',
    patrolArea: 'Purok 10-12',
    status: 'scheduled',
  },
];

/**
 * Sample attendance records
 */
const sampleAttendance = (tanodIds) => [
  {
    tanodId: tanodIds[0],
    tanodName: 'Pedro Santos',
    date: new Date(),
    checkInTime: new Date(new Date().setHours(6, 0, 0)),
    checkOutTime: null,
    duration: null,
    shift: 'day',
    status: 'on-duty',
    notes: '',
  },
  {
    tanodId: tanodIds[1],
    tanodName: 'Maria Garcia',
    date: new Date(Date.now() - 86400000), // Yesterday
    checkInTime: new Date(new Date(Date.now() - 86400000).setHours(18, 0, 0)),
    checkOutTime: new Date(new Date().setHours(6, 0, 0)),
    duration: 720, // 12 hours in minutes
    shift: 'night',
    status: 'present',
    notes: 'Completed night patrol',
  },
  {
    tanodId: tanodIds[3],
    tanodName: 'Ana Cruz',
    date: new Date(Date.now() - 86400000), // Yesterday
    checkInTime: new Date(new Date(Date.now() - 86400000).setHours(6, 15, 0)),
    checkOutTime: new Date(new Date(Date.now() - 86400000).setHours(18, 0, 0)),
    duration: 705, // 11.75 hours in minutes
    shift: 'day',
    status: 'late',
    notes: '15 minutes late',
  },
];

/**
 * Seed users (Tanod members) to Firebase
 */
export const seedTanodUsers = async () => {
  try {
    const createdIds = [];
    
    for (const user of sampleTanodUsers) {
      const docId = await createDocument(COLLECTIONS.USERS, user);
      createdIds.push(docId);
      console.log(`Created tanod user: ${user.displayName} (ID: ${docId})`);
    }
    
    toast.success(`Successfully created ${createdIds.length} tanod members!`);
    return createdIds;
  } catch (error) {
    console.error('Error seeding tanod users:', error);
    toast.error('Failed to seed tanod users');
    throw error;
  }
};

/**
 * Seed incidents to Firebase
 */
export const seedIncidents = async (tanodIds = []) => {
  try {
    const createdIds = [];
    
    for (let i = 0; i < sampleIncidents.length; i++) {
      const incident = { ...sampleIncidents[i] };
      
      // Assign some incidents to tanod members
      if (tanodIds.length > 0 && i % 3 === 0) {
        incident.assignedTo = tanodIds[i % tanodIds.length];
      }
      
      const docId = await createDocument(COLLECTIONS.INCIDENTS, incident);
      createdIds.push(docId);
      console.log(`Created incident: ${incident.title} (ID: ${docId})`);
    }
    
    toast.success(`Successfully created ${createdIds.length} incidents!`);
    return createdIds;
  } catch (error) {
    console.error('Error seeding incidents:', error);
    toast.error('Failed to seed incidents');
    throw error;
  }
};

/**
 * Seed schedules to Firebase
 */
export const seedSchedules = async (tanodIds) => {
  try {
    if (!tanodIds || tanodIds.length === 0) {
      console.warn('No tanod IDs provided, skipping schedules');
      return [];
    }
    
    const createdIds = [];
    const schedules = sampleSchedules(tanodIds);
    
    for (const schedule of schedules) {
      const docId = await createDocument(COLLECTIONS.SCHEDULES, schedule);
      createdIds.push(docId);
      console.log(`Created schedule for: ${schedule.tanodName} (ID: ${docId})`);
    }
    
    toast.success(`Successfully created ${createdIds.length} schedules!`);
    return createdIds;
  } catch (error) {
    console.error('Error seeding schedules:', error);
    toast.error('Failed to seed schedules');
    throw error;
  }
};

/**
 * Seed attendance records to Firebase
 */
export const seedAttendance = async (tanodIds) => {
  try {
    if (!tanodIds || tanodIds.length === 0) {
      console.warn('No tanod IDs provided, skipping attendance');
      return [];
    }
    
    const createdIds = [];
    const attendance = sampleAttendance(tanodIds);
    
    for (const record of attendance) {
      const docId = await createDocument(COLLECTIONS.ATTENDANCE, record);
      createdIds.push(docId);
      console.log(`Created attendance for: ${record.tanodName} (ID: ${docId})`);
    }
    
    toast.success(`Successfully created ${createdIds.length} attendance records!`);
    return createdIds;
  } catch (error) {
    console.error('Error seeding attendance:', error);
    toast.error('Failed to seed attendance');
    throw error;
  }
};

/**
 * Seed all sample data to Firebase
 * This is the main function to call for complete data seeding
 */
export const seedAllData = async () => {
  try {
    toast.info('Starting data seeding process...');
    
    // Step 1: Create tanod users
    console.log('Step 1: Creating tanod users...');
    const tanodIds = await seedTanodUsers();
    
    // Step 2: Create incidents (some assigned to tanod members)
    console.log('Step 2: Creating incidents...');
    await seedIncidents(tanodIds);
    
    // Step 3: Create schedules for tanod members
    console.log('Step 3: Creating schedules...');
    await seedSchedules(tanodIds);
    
    // Step 4: Create attendance records
    console.log('Step 4: Creating attendance records...');
    await seedAttendance(tanodIds);
    
    toast.success('All sample data has been seeded successfully! 🎉');
    console.log('Data seeding completed successfully!');
    
    return {
      tanodIds,
      success: true,
    };
  } catch (error) {
    console.error('Error during data seeding:', error);
    toast.error('Data seeding failed. Please check console for details.');
    throw error;
  }
};

/**
 * Clear all collections (use with caution!)
 * Note: This only deletes documents created through the app
 * You may need to manually delete from Firebase Console for complete cleanup
 */
export const clearAllData = async () => {
  const confirmed = window.confirm(
    'WARNING: This will attempt to delete all data from Firebase. This action cannot be undone. Are you sure?'
  );
  
  if (!confirmed) {
    return;
  }
  
  toast.warning('Data clearing feature not implemented. Please use Firebase Console to delete collections manually.');
  console.log('To clear data, please use the Firebase Console: https://console.firebase.google.com/');
};

export default {
  seedTanodUsers,
  seedIncidents,
  seedSchedules,
  seedAttendance,
  seedAllData,
  clearAllData,
};
