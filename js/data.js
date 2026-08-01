/* data.js — Embedded campus data (no Excel, no fetch) */
'use strict';

const CATEGORIES = [
  { id:'Office',   icon:'🏢', color:'#2563eb', label:'Offices' },
  { id:'Academic', icon:'📚', color:'#7c3aed', label:'Academic Rooms' },
  { id:'Building', icon:'🏬', color:'#64748b', label:'Buildings' },
  { id:'Facility', icon:'🚪', color:'#0891b2', label:'Facilities' },
  { id:'Park',     icon:'🌳', color:'#16a34a', label:'Parks' },
  { id:'Sports',   icon:'⚽', color:'#ea580c', label:'Sports' },
  { id:'Service',  icon:'🛎️', color:'#db2777', label:'Student Services' },
  { id:'Restroom', icon:'🚻', color:'#475569', label:'Bathrooms' },
  { id:'Shop',     icon:'🛍️', color:'#ca8a04', label:'Shops' },
];

const ENTRANCES = {
  'Main Gate':   { x:40,  y:615, label:'Main Gate' },
  'Kadiwa Gate': { x:525, y:655, label:'Kadiwa Gate' },
};

function catColor(cat) {
  const c = CATEGORIES.find(x => x.id === cat);
  return c ? c.color : '#64748b';
}
function catIcon(cat) {
  const c = CATEGORIES.find(x => x.id === cat);
  return c ? c.icon : '📍';
}

const LOCATIONS = [
  // ── Buildings ──
  { id:'auditorium', keyword:'Auditorium', alias:'CC Auditorium,Gymnasium',
    building:'Auditorium', floor:'Ground', room:'Auditorium', category:'Building',
    description:'Main venue for university events, programs, and general assemblies.',
    nearby:'Main Building, Campus Grounds, Campus Amphitheater',
    directions:'Start from Main Gate. Walk straight past the Commercial Building. The Auditorium is the large pink building at the top-left.',
    x:300, y:100 },

  { id:'auditorium_ext', keyword:'Auditorium Extension', alias:'Extension,Bath Storage', alias:'Bathroom Storage,Bath Storage',
    building:'Auditorium Extension', floor:'Ground', room:'Auditorium Extension',
    category:'Facility',
    description:'Storage area and bathrooms attached to the Auditorium.',
    nearby:'Auditorium, Campus Amphitheater',
    directions:'Start from Main Gate. Walk past the Auditorium. The blue-outlined building to its right is the Auditorium Extension.',
    x:510, y:80 },

  { id:'crim', keyword:'CRIM Building', alias:'Crim,Criminology',
    building:'CRIM Building', floor:'Ground', room:'CRIM Building', category:'Building',
    description:'Home of the Criminology department.',
    nearby:'Firing Range, Fish Pond',
    directions:'Start from Main Gate. Walk toward the top-right. The CRIM Building is near the Fish Pond.',
    x:795, y:65 },

  { id:'crim_bath', keyword:'CRIM Bathroom', alias:'CRIM CR,CRIM Restroom',
    building:'CRIM Building', floor:'1st Floor', room:'Bathroom', category:'Restroom',
    description:'First-floor bathroom in the CRIM Building.',
    nearby:'CRIM Building, Fish Pond',
    directions:'Enter the CRIM Building. The bathroom is on the first floor.',
    x:820, y:100 },

  { id:'firing', keyword:'Firing Range', alias:'Range,Shooting Range',
    building:'CRIM Building', floor:'Ground', room:'Firing Range', category:'Sports',
    description:'Criminology training facility for marksmanship. Access restricted to authorized personnel.',
    nearby:'CRIM Building',
    directions:'Enter the CRIM Building. The Firing Range is the small red block attached to the right.',
    x:910, y:50 },

  { id:'amphitheater', keyword:'Campus Amphitheater', alias:'Park,Amphitheater,Mini Park',
    building:'Campus Amphitheater', floor:'Ground', room:'Campus Amphitheater', category:'Park',
    description:'Central campus amphitheater with circular garden. Popular spot for students to rest.',
    nearby:'Main Building, CRIM Building, Auditorium Extension',
    directions:'Start from Main Gate. Walk past the under-construction area. The circular Amphitheater is on the right.',
    x:565, y:215 },

  { id:'icc', keyword:'ICC', alias:'ICC Building,Commercial Building',
    building:'ICC (Commercial Building)', floor:'Ground', room:'ICC (Commercial Building)',
    category:'Building',
    description:'Commercial building closest to the Main Gate. Houses small businesses, food stalls, and service shops.',
    nearby:'Main Gate',
    directions:'Start from Main Gate. Walk straight ahead. The tall gold-outlined building on your left is the ICC.',
    x:90, y:265 },

  { id:'main_building', keyword:'Main Building', alias:'Main Bldg,Administration Building',
    building:'Main Building', floor:'Ground', room:'Main Building', category:'Building',
    description:'Central academic and administrative building with 5 floors. Contains the Registrar, Guidance, Clinic, Library, labs, and classrooms.',
    nearby:'Campus Amphitheater, Auditorium, Kadiwa Market',
    directions:'Start from Main Gate. Walk past the Commercial Building and the under-construction area. The Main Building is the large dark building on the right.',
    x:580, y:380 },

  { id:'kadiwa', keyword:'Kadiwa', alias:'Kadiwa Store,Kadiwa Canteen,Kadiwa Market',
    building:'Kadiwa Market', floor:'Ground', room:'Kadiwa Market', category:'Shop',
    description:'Campus store and canteen near the Kadiwa Gate. Sells food, snacks, and daily necessities.',
    nearby:'Kadiwa Gate, Main Building',
    directions:'Start from Kadiwa Gate. Walk straight. Kadiwa Market is on the right side.',
    x:630, y:560 },

  { id:'grounds', keyword:'Campus Grounds', alias:'CC Grounds,Open Grounds,Sports Complex,Gym',
    building:'Campus Grounds', floor:'Ground', room:'Campus Grounds', category:'Facility',
    description:'Open green grounds beside the Auditorium for flag ceremonies, outdoor events, and sports activities.',
    nearby:'Auditorium, Main Building',
    directions:'Start from Main Gate. Walk toward the Auditorium. Campus Grounds is the green area on the bottom-left.',
    x:170, y:490 },

  { id:'construction', keyword:'Under Construction', alias:'Construction,New Building',
    building:'Under Construction', floor:'Ground', room:'Under Construction', category:'Building',
    description:'Area currently under construction. Future campus expansion.',
    nearby:'Main Building, Campus Grounds',
    directions:'Start from Main Gate. Walk toward the center. The brown cross-hatched area is the construction zone.',
    x:330, y:255 },

  { id:'fish_pond', keyword:'Fish Pond', alias:'Pond,Fish Pond',
    building:'Fish Pond', floor:'Ground', room:'Fish Pond', category:'Facility',
    description:'Decorative fish pond near the CRIM Building and Amphitheater.',
    nearby:'Campus Amphitheater, CRIM Building',
    directions:'Start from Main Gate. Walk past the Amphitheater toward the right. The Fish Pond is the circular area near the CRIM Building.',
    x:730, y:180 },

  // ── Main Building — Basement ──
  { id:'canteen', keyword:'Canteen', alias:'Basement Canteen,Cafeteria,Food Court',
    building:'Main Building', floor:'Basement', room:'Canteen', category:'Shop',
    description:'University canteen serving meals and snacks.',
    nearby:'Main Building stairs',
    directions:'Enter the Main Building. Take the stairs down to the Basement. The Canteen is at the bottom.',
    x:530, y:330 },

  // ── Main Building — 1st Floor ──
  { id:'registrar', keyword:'Registrar', alias:'Enrollment,Records,Registration',
    building:'Main Building', floor:'1st Floor', room:'Registrar', category:'Office',
    description:'Handles student enrollment, registration, records, and document requests.',
    nearby:'Gallery Walk, Quality Assurance',
    directions:'Enter the Main Building. Go to the 1st Floor. The Registrar is beside the Quality Assurance office.',
    x:555, y:360 },

  { id:'qa', keyword:'Quality Assurance', alias:'QA Office,QAO',
    building:'Main Building', floor:'1st Floor', room:'Quality Assurance Office', category:'Office',
    description:'Monitors academic quality, evaluates programs, and manages accreditation.',
    nearby:'Gallery Walk, Registrar',
    directions:'Enter the Main Building. On the 1st Floor, QA is beside the Registrar.',
    x:515, y:360 },

  { id:'research', keyword:'Research Room', alias:'Research Office,Research Center',
    building:'Main Building', floor:'1st Floor', room:'Research Room', category:'Office',
    description:'Supports faculty and student research, proposals, and publications.',
    nearby:'Gallery Walk',
    directions:'Enter the Main Building. On the 1st Floor, the Research Room is near the Gallery Walk.',
    x:595, y:360 },

  { id:'gallery', keyword:'Gallery Walk', alias:'Gallery,Hallway Gallery',
    building:'Main Building', floor:'1st Floor', room:'Gallery Walk', category:'Facility',
    description:'Wide corridor for exhibits, student projects, and as the main walkway between offices.',
    nearby:'Registrar, Quality Assurance, Guidance',
    directions:'Enter the Main Building. The Gallery Walk runs along the 1st Floor.',
    x:575, y:350 },

  { id:'guidance', keyword:'Guidance Office', alias:'Guidance,Counseling,Guidance and Counseling',
    building:'Main Building', floor:'1st Floor', room:'Guidance Office', category:'Office',
    description:'Provides counseling, student support, and academic guidance.',
    nearby:'Clinic, Registrar',
    directions:'Enter the Main Building. On the 1st Floor, the Guidance Office is beside the Clinic.',
    x:620, y:390 },

  { id:'clinic', keyword:'Clinic', alias:'Health Clinic,Medical,First Aid',
    building:'Main Building', floor:'1st Floor', room:'Clinic', category:'Service',
    description:'Campus health clinic for first aid, check-ups, and medical assistance.',
    nearby:'Guidance Office',
    directions:'Enter the Main Building. On the 1st Floor, the Clinic is beside the Guidance Office.',
    x:650, y:390 },

  { id:'bath_1st', keyword:'Bathroom 1st', alias:'CR 1st,Comfort Room 1st,Restroom 1st',
    building:'Main Building', floor:'1st Floor', room:'Bathroom', category:'Restroom',
    description:'Bathrooms on the 1st floor of the Main Building.',
    nearby:'Gallery Walk',
    directions:'Enter the Main Building. The 1st Floor bathrooms are at the end of the Gallery Walk.',
    x:650, y:340 },

  // ── Main Building — 2nd Floor ──
  { id:'comlab', keyword:'Computer Laboratory', alias:'ComLab,Computer Lab,ICT Lab',
    building:'Main Building', floor:'2nd Floor', room:'Computer Laboratories', category:'Academic',
    description:'Computer laboratories for IT, programming, and computer-based classes.',
    nearby:'Sound Engineering Room',
    directions:'Enter the Main Building. Take the stairs to the 2nd Floor. The labs are straight ahead.',
    x:530, y:400 },

  { id:'sound', keyword:'Sound Engineering Room', alias:'Sound Lab,Audio Engineering',
    building:'Main Building', floor:'2nd Floor', room:'Sound Engineering Room', category:'Academic',
    description:'Specialized room for sound and audio engineering classes.',
    nearby:'Computer Laboratories, Drawing Room',
    directions:'Enter the Main Building. Take the stairs to the 2nd Floor. The Sound Engineering Room is near the labs.',
    x:575, y:400 },

  { id:'drawing', keyword:'Drawing Room', alias:'Drawing Studio,Drafting Room',
    building:'Main Building', floor:'2nd Floor', room:'Drawing Room', category:'Academic',
    description:'Studio room for drawing, drafting, and visual arts.',
    nearby:'Sound Engineering Room, Uniform Shop',
    directions:'Enter the Main Building. Take the stairs to the 2nd Floor. The Drawing Room is on the right.',
    x:620, y:400 },

  { id:'uniform', keyword:'Uniform Shop', alias:'Uniform,School Uniform,Bookstore',
    building:'Main Building', floor:'2nd Floor', room:'Uniform Shop', category:'Shop',
    description:'Sells school uniforms and official school items.',
    nearby:'Drawing Room',
    directions:'Enter the Main Building. Take the stairs to the 2nd Floor. The Uniform Shop is at the end.',
    x:655, y:420 },

  { id:'bath_2nd', keyword:'Bathroom 2nd', alias:'CR 2nd,Comfort Room 2nd,Restroom 2nd',
    building:'Main Building', floor:'2nd Floor', room:'Bathroom', category:'Restroom',
    description:'Bathrooms on the 2nd floor of the Main Building.',
    nearby:'Computer Laboratories',
    directions:'Enter the Main Building. Take the stairs to the 2nd Floor. The bathrooms are beside the stairwell.',
    x:655, y:400 },

  // ── Main Building — 3rd Floor ──
  { id:'architecture', keyword:'Architecture Rooms', alias:'ARC Room,Architecture',
    building:'Main Building', floor:'3rd Floor', room:'Architecture Rooms', category:'Academic',
    description:'Classrooms and studio spaces for the Architecture program.',
    nearby:'Library',
    directions:'Enter the Main Building. Take the stairs to the 3rd Floor. Architecture rooms are on the left.',
    x:530, y:430 },

  { id:'library', keyword:'Library', alias:'Reading Area,Library Reading Area,Study Hall',
    building:'Main Building', floor:'3rd Floor', room:'Library', category:'Office',
    description:'Main campus library with reading areas, study spaces, and research materials.',
    nearby:'Architecture Rooms',
    directions:'Enter the Main Building. Take the stairs to the 3rd Floor. The Library is on the right.',
    x:620, y:430 },

  { id:'bath_3rd', keyword:'Bathroom 3rd', alias:'CR 3rd,Comfort Room 3rd,Restroom 3rd',
    building:'Main Building', floor:'3rd Floor', room:'Bathroom', category:'Restroom',
    description:'Bathrooms on the 3rd floor of the Main Building.',
    nearby:'Library, Architecture Rooms',
    directions:'Enter the Main Building. Take the stairs to the 3rd Floor. The bathrooms are near the stairwell.',
    x:655, y:430 },

  // ── Main Building — 4th Floor ──
  { id:'class4', keyword:'Classrooms 4th', alias:'Room 401,Room 402,Room 403,Room 404,Rooms 401-404',
    building:'Main Building', floor:'4th Floor', room:'Classrooms', category:'Academic',
    description:'General classrooms on the 4th floor (rooms 401-404).',
    nearby:'4th Floor bathroom',
    directions:'Enter the Main Building. Take the stairs to the 4th Floor. Classrooms line the hallway.',
    x:575, y:455 },

  { id:'room401', keyword:'Room 401', alias:'401',
    building:'Main Building', floor:'4th Floor', room:'Room 401', category:'Academic',
    description:'General classroom on the 4th floor.',
    nearby:'4th Floor hallway',
    directions:'Enter the Main Building. Take the stairs to the 4th Floor. Room 401 is first on the left.',
    x:530, y:455 },

  { id:'room402', keyword:'Room 402', alias:'402',
    building:'Main Building', floor:'4th Floor', room:'Room 402', category:'Academic',
    description:'General classroom on the 4th floor.',
    nearby:'Room 401',
    directions:'Enter the Main Building. Take the stairs to the 4th Floor. Room 402 is second on the left.',
    x:555, y:455 },

  { id:'room403', keyword:'Room 403', alias:'403',
    building:'Main Building', floor:'4th Floor', room:'Room 403', category:'Academic',
    description:'General classroom on the 4th floor.',
    nearby:'Room 404',
    directions:'Enter the Main Building. Take the stairs to the 4th Floor. Room 403 is first on the right.',
    x:600, y:455 },

  { id:'room404', keyword:'Room 404', alias:'404',
    building:'Main Building', floor:'4th Floor', room:'Room 404', category:'Academic',
    description:'General classroom on the 4th floor.',
    nearby:'Room 403',
    directions:'Enter the Main Building. Take the stairs to the 4th Floor. Room 404 is second on the right.',
    x:630, y:455 },

  { id:'bath_4th', keyword:'Bathroom 4th', alias:'CR 4th,Comfort Room 4th,Restroom 4th',
    building:'Main Building', floor:'4th Floor', room:'Bathroom', category:'Restroom',
    description:'Bathrooms on the 4th floor of the Main Building.',
    nearby:'4th Floor classrooms',
    directions:'Enter the Main Building. Take the stairs to the 4th Floor. The bathrooms are near the stairwell.',
    x:655, y:455 },

  // ── Main Building — 5th Floor ──
  { id:'class5', keyword:'Classrooms 5th', alias:'Rooms 501-504,Room 501,Room 502,Room 503',
    building:'Main Building', floor:'5th Floor', room:'Classrooms', category:'Academic',
    description:'General classrooms on the 5th floor (rooms 501-504).',
    nearby:'5th Floor bathroom',
    directions:'Enter the Main Building. Take the stairs to the 5th Floor. Classrooms line the hallway.',
    x:575, y:480 },

  { id:'room504', keyword:'Room 504', alias:'504',
    building:'Main Building', floor:'5th Floor', room:'Room 504', category:'Academic',
    description:'General classroom on the 5th floor.',
    nearby:'5th Floor hallway',
    directions:'Enter the Main Building. Take the stairs to the 5th Floor. Room 504 is on the right.',
    x:620, y:480 },

  { id:'bath_5th', keyword:'Bathroom 5th', alias:'CR 5th,Comfort Room 5th,Restroom 5th',
    building:'Main Building', floor:'5th Floor', room:'Bathroom', category:'Restroom',
    description:'Bathrooms on the 5th floor of the Main Building.',
    nearby:'5th Floor classrooms',
    directions:'Enter the Main Building. Take the stairs to the 5th Floor. The bathrooms are near the stairwell.',
    x:655, y:480 },

  // ── Other Facilities ──
  { id:'main_gate', keyword:'Main Gate', alias:'Entrance,Front Gate',
    building:'Main Gate', floor:'Ground', room:'Main Gate', category:'Facility',
    description:'Main campus entrance. Security checkpoint for students and visitors.',
    nearby:'ICC',
    directions:'The Main Gate is the primary entrance. Walk straight to reach the Main Building.',
    x:40, y:615 },

  { id:'kadiwa_gate', keyword:'Kadiwa Gate', alias:'Side Gate,Back Gate',
    building:'Kadiwa Gate', floor:'Ground', room:'Kadiwa Gate', category:'Facility',
    description:'Secondary entrance near Kadiwa Market and the Main Building.',
    nearby:'Kadiwa Market',
    directions:'The Kadiwa Gate is the secondary entrance. Walk straight to reach Kadiwa Market.',
    x:525, y:655 },
];

const LocationStore = (() => {
  let data = LOCATIONS;
  function all() { return data; }
  function byId(id) { return data.find(l => l.id === id); }
  function buildings() {
    const seen = new Map();
    for (const l of data) { if (!seen.has(l.building)) seen.set(l.building, l); }
    return [...seen.values()];
  }
  return { all, byId, buildings };
})();
