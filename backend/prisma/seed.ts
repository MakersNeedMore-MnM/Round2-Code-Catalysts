/**
 * RescueGrid AI — Database Seed Script
 * ⚠️ DEVELOPMENT DATA ONLY — All records marked isDevelopmentData=true
 * DO NOT use in production environments
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

type ResourceType = string;
type ResourceStatus = string;
type DisasterType = string;
type Severity = string;
type IncidentStatus = string;
type Role = string;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding RescueGrid AI development data...\n');

  // ── Users ──────────────────────────────────────────────────
  const adminPw = await bcrypt.hash('admin123', 12);
  const userPw = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rescuegrid.dev' },
    update: {},
    create: { name: 'Admin Controller', email: 'admin@rescuegrid.dev', password: adminPw, role: 'ADMIN' }
  });

  const authority = await prisma.user.upsert({
    where: { email: 'authority@rescuegrid.dev' },
    update: {},
    create: { name: 'District Authority', email: 'authority@rescuegrid.dev', password: adminPw, role: 'AUTHORITY' }
  });

  const rescuer = await prisma.user.upsert({
    where: { email: 'rescuer@rescuegrid.dev' },
    update: {},
    create: { name: 'Field Rescuer', email: 'rescuer@rescuegrid.dev', password: userPw, role: 'RESCUER' }
  });

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@rescuegrid.dev' },
    update: {},
    create: { name: 'Test Citizen', email: 'citizen@rescuegrid.dev', password: userPw, role: 'CITIZEN' }
  });

  console.log('✅ Users created');

  // ── Resources ──────────────────────────────────────────────
  const resourcesData = [
    { name: 'Boat Team Alpha', type: 'BOAT' as ResourceType, capability: 'Flood Rescue + Water Extraction', capacity: 20, latitude: 17.405, longitude: 78.477, locationName: 'Station 3, River District', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Boat Team Bravo', type: 'BOAT' as ResourceType, capability: 'Flood Rescue', capacity: 15, latitude: 17.385, longitude: 78.450, locationName: 'Station 7, Lake Area', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Fire Brigade 1', type: 'FIRE_TEAM' as ResourceType, capability: 'Fire Suppression + Rescue', capacity: 12, latitude: 17.395, longitude: 78.490, locationName: 'Central Fire Station', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Fire Brigade 2', type: 'FIRE_TEAM' as ResourceType, capability: 'Building Fire + Chemical Hazard', capacity: 10, latitude: 17.370, longitude: 78.465, locationName: 'North Fire Station', status: 'BUSY' as ResourceStatus },
    { name: 'Ambulance Unit 1', type: 'AMBULANCE' as ResourceType, capability: 'Emergency Medical', capacity: 4, latitude: 17.415, longitude: 78.480, locationName: 'City Hospital Base', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Ambulance Unit 2', type: 'AMBULANCE' as ResourceType, capability: 'Emergency Medical + Paramedic', capacity: 4, latitude: 17.380, longitude: 78.455, locationName: 'South Medical Base', status: 'ASSIGNED' as ResourceStatus },
    { name: 'Medical Team Alpha', type: 'MEDICAL_TEAM' as ResourceType, capability: 'Field Medical + Triage', capacity: 8, latitude: 17.400, longitude: 78.470, locationName: 'District Medical Center', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Search & Rescue Team 1', type: 'RESCUE_TEAM' as ResourceType, capability: 'Urban Search & Rescue, Debris Clearance', capacity: 15, latitude: 17.390, longitude: 78.485, locationName: 'NDRF Base Camp', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Search & Rescue Team 2', type: 'RESCUE_TEAM' as ResourceType, capability: 'Mountain + Landslide Rescue', capacity: 12, latitude: 17.375, longitude: 78.460, locationName: 'East Rescue Station', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Drone Unit Alpha', type: 'DRONE' as ResourceType, capability: 'Aerial Surveillance + Thermal Imaging', capacity: 1, latitude: 17.395, longitude: 78.472, locationName: 'Central Command', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Volunteer Team 1', type: 'VOLUNTEER_TEAM' as ResourceType, capability: 'Evacuation + Relief Distribution', capacity: 30, latitude: 17.388, longitude: 78.468, locationName: 'Community Center', status: 'AVAILABLE' as ResourceStatus },
    { name: 'Rescue Vehicle RV-1', type: 'RESCUE_VEHICLE' as ResourceType, capability: 'Heavy Equipment Transport + Debris Removal', capacity: 6, latitude: 17.402, longitude: 78.483, locationName: 'Public Works Depot', status: 'AVAILABLE' as ResourceStatus },
  ];

  const createdResources: any[] = [];
  for (const r of resourcesData) {
    const resource = await prisma.resource.upsert({
      where: { id: r.name.replace(/\s/g, '_').toLowerCase() },
      update: {},
      create: { ...r, isDevelopmentData: true }
    }).catch(async () => {
      return prisma.resource.create({ data: { ...r, isDevelopmentData: true } });
    });
    createdResources.push(resource);
  }
  console.log(`✅ ${createdResources.length} resources created`);

  // ── Incidents ──────────────────────────────────────────────
  const incidentsData = [
    {
      incidentNumber: 'RG-DEV-001',
      type: 'FLOOD' as DisasterType,
      description: '[DEV DATA] 10 people are trapped in a flooded school near the lake. Water has entered the first floor and is rising rapidly. Several children and elderly teachers are unable to evacuate.',
      latitude: 17.4005,
      longitude: 78.4734,
      locationName: 'Government School, Sector 4, Lake District [DEV]',
      peopleAffected: 10,
      vulnerablePeople: true,
      severity: 'CRITICAL' as Severity,
      accessibility: 'Poor',
      timeSensitivity: 'Critical',
      priorityScore: 94,
      confidenceScore: 0.92,
      status: 'RESOURCE_RECOMMENDED' as IncidentStatus,
    },
    {
      incidentNumber: 'RG-DEV-002',
      type: 'ROAD_ACCIDENT' as DisasterType,
      description: '[DEV DATA] Major road accident on National Highway 44. A truck has overturned blocking all lanes. Ambulance is unable to pass. 3 people injured, one critically.',
      latitude: 17.3850,
      longitude: 78.4600,
      locationName: 'NH-44, Near Toll Plaza, North Highway [DEV]',
      peopleAffected: 3,
      vulnerablePeople: false,
      severity: 'HIGH' as Severity,
      accessibility: 'Poor',
      timeSensitivity: 'High',
      priorityScore: 71,
      confidenceScore: 0.85,
      status: 'VERIFIED' as IncidentStatus,
    },
    {
      incidentNumber: 'RG-DEV-003',
      type: 'FIRE' as DisasterType,
      description: '[DEV DATA] Residential building fire in Sector 12. Fire spreading to adjacent floors. Elderly residents on upper floors reported. Fire brigade requested immediately.',
      latitude: 17.3950,
      longitude: 78.4900,
      locationName: 'Sunflower Apartments, Sector 12 [DEV]',
      peopleAffected: 25,
      vulnerablePeople: true,
      severity: 'VERY_HIGH' as Severity,
      accessibility: 'Moderate',
      timeSensitivity: 'Critical',
      priorityScore: 88,
      confidenceScore: 0.88,
      status: 'RESCUE_EN_ROUTE' as IncidentStatus,
    },
    {
      incidentNumber: 'RG-DEV-004',
      type: 'LANDSLIDE' as DisasterType,
      description: '[DEV DATA] Landslide blocking main road access to hill village. Around 150 residents cut off. No injuries reported yet but medical supplies and food running low.',
      latitude: 17.3700,
      longitude: 78.5100,
      locationName: 'Hill Village Road, Sector 9, Eastern Hills [DEV]',
      peopleAffected: 150,
      vulnerablePeople: false,
      severity: 'HIGH' as Severity,
      accessibility: 'Poor',
      timeSensitivity: 'High',
      priorityScore: 78,
      confidenceScore: 0.79,
      status: 'PRIORITIZED' as IncidentStatus,
    },
    {
      incidentNumber: 'RG-DEV-005',
      type: 'MEDICAL_EMERGENCY' as DisasterType,
      description: '[DEV DATA] Mass casualty event at temporary relief shelter. Over 40 people showing symptoms of food poisoning. Medical team and additional supplies urgently required.',
      latitude: 17.4100,
      longitude: 78.4400,
      locationName: 'Relief Shelter Camp, Sector 2 [DEV]',
      peopleAffected: 40,
      vulnerablePeople: true,
      severity: 'VERY_HIGH' as Severity,
      accessibility: 'Good',
      timeSensitivity: 'High',
      priorityScore: 82,
      confidenceScore: 0.90,
      status: 'RESOURCE_ASSIGNED' as IncidentStatus,
    }
  ];

  const createdIncidents: any[] = [];
  for (const i of incidentsData) {
    const incident = await prisma.incident.upsert({
      where: { incidentNumber: i.incidentNumber },
      update: {},
      create: { ...i, isDevelopmentData: true }
    });
    createdIncidents.push(incident);

    // Create a report for each incident
    await prisma.report.create({
      data: {
        incidentId: incident.id,
        reporterId: citizen.id,
        type: 'TEXT',
        text: i.description,
        latitude: i.latitude + (Math.random() - 0.5) * 0.01,
        longitude: i.longitude + (Math.random() - 0.5) * 0.01,
        locationName: i.locationName,
        confidence: i.confidenceScore,
        verificationStatus: 'VERIFIED',
        isDevelopmentData: true
      }
    });

    // Create alert for high-priority incidents
    if (i.priorityScore >= 80) {
      await prisma.alert.create({
        data: {
          incidentId: incident.id,
          title: `[DEV] CRITICAL: ${i.type.replace('_', ' ')} — ${i.incidentNumber}`,
          message: i.description.substring(0, 150),
          severity: i.priorityScore >= 86 ? 'CRITICAL' : 'HIGH',
          isRead: false
        }
      });
    }
  }

  // Assign Fire Brigade to fire incident
  const fireIncident = createdIncidents.find(i => i.type === 'FIRE');
  const fireBrigade = createdResources.find(r => r.name === 'Fire Brigade 1');
  if (fireIncident && fireBrigade) {
    await prisma.resourceAssignment.create({
      data: {
        incidentId: fireIncident.id,
        resourceId: fireBrigade.id,
        eta: 6,
        status: 'EN_ROUTE',
        notes: '[DEV] Automatically assigned during seed'
      }
    });
    await prisma.resource.update({ where: { id: fireBrigade.id }, data: { status: 'EN_ROUTE' } });
  }

  // Audit logs
  await prisma.auditLog.createMany({
    data: createdIncidents.map(i => ({
      userId: admin.id,
      incidentId: i.id,
      action: 'Development seed: Incident created',
      details: JSON.stringify({ seed: true, timestamp: new Date().toISOString() })
    }))
  });

  console.log(`✅ ${createdIncidents.length} development incidents created`);
  console.log('\n📋 Development Login Credentials:');
  console.log('   Admin:     admin@rescuegrid.dev / admin123');
  console.log('   Authority: authority@rescuegrid.dev / admin123');
  console.log('   Rescuer:   rescuer@rescuegrid.dev / user123');
  console.log('   Citizen:   citizen@rescuegrid.dev / user123');
  console.log('\n⚠️  All seed data is marked as DEVELOPMENT DATA and should not be used in production.\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
