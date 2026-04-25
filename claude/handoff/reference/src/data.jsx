/* Mock data — realistic French restaurant reservation data, "Agrùm" restaurant */

const RESTAURANT = {
  name: "Agrùm",
  city: "Lille",
  type: "Bistrot méditerranéen",
  email: "direction@akasen.fr",
  phone: "+33 6 12 34 56 78",
  cover: 26,
  isLinked: true,
};

const TODAY_DATE = new Date(2026, 3, 25); // samedi 25 avril 2026

// Reservations for "Aujourd'hui" — mix of statuses, services
const RESERVATIONS_TODAY = [
  { id:"r1",  time:"12:00", first:"Camille", last:"Roux",     party:2, status:"confirmed", source:"widget",  table:"T2",  notes:"Anniversaire — dessert surprise", phone:"06 12 34 56 78" },
  { id:"r2",  time:"12:15", first:"Hugo",    last:"Bernard",  party:4, status:"confirmed", source:"agent",   table:"grande table", notes:"Allergique aux fruits de mer" },
  { id:"r3",  time:"12:30", first:"Léa",     last:"Petit",    party:3, status:"pending",   source:"widget",  table:"T7",  notes:"" },
  { id:"r4",  time:"12:30", first:"Thomas",  last:"Garcia",   party:2, status:"confirmed", source:"phone",   table:"T1",  notes:"Repeat client (3e visite)" },
  { id:"r5",  time:"13:00", first:"Sophie",  last:"Martin",   party:5, status:"confirmed", source:"agent",   table:"grande table", notes:"Réunion famille" },
  { id:"r6",  time:"13:15", first:"Antoine", last:"Lefevre",  party:2, status:"confirmed", source:"widget",  table:"T6",  notes:"" },
  { id:"r7",  time:"19:30", first:"Marion",  last:"Durand",   party:2, status:"confirmed", source:"widget",  table:"T1",  notes:"" },
  { id:"r8",  time:"19:45", first:"Julien",  last:"Moreau",   party:6, status:"confirmed", source:"agent",   table:"grande table", notes:"Demande terrasse si dispo" },
  { id:"r9",  time:"20:00", first:"Inès",    last:"Faure",    party:2, status:"pending",   source:"widget",  table:"T2",  notes:"" },
  { id:"r10", time:"20:15", first:"Maxime",  last:"Robin",    party:4, status:"confirmed", source:"phone",   table:"T7",  notes:"" },
  { id:"r11", time:"20:30", first:"Clara",   last:"Vincent",  party:2, status:"confirmed", source:"widget",  table:"T6",  notes:"Sans gluten" },
  { id:"r12", time:"21:00", first:"Élodie",  last:"Henry",    party:3, status:"pending",   source:"agent",   table:"T3",  notes:"" },
];

// Tables (matches the 3 zones from screenshot: grande table / pas (terrasse) / verger)
const TABLES = [
  { id:"T3",  name:"T3", seats:2, zone:"grande table", x:120, y:60 },
  { id:"GT1", name:"T4", seats:4, zone:"grande table", x:220, y:60 },
  { id:"T1",  name:"1",  seats:7, zone:"pas (terrasse)", x:300, y:240 },
  { id:"T2",  name:"2",  seats:4, zone:"pas (terrasse)", x:400, y:240 },
  { id:"T6",  name:"T6", seats:2, zone:"verger (4 pl)",  x:560, y:240 },
  { id:"T7",  name:"T7", seats:4, zone:"verger (4 pl)",  x:660, y:240 },
];

// Hours
const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const HOURS = {
  Lundi:    { open:true,  services:[{name:"Déjeuner", from:"12:00", to:"14:30", duration:90, interval:15}] },
  Mardi:    { open:true,  services:[{name:"Déjeuner", from:"12:00", to:"14:30", duration:90, interval:15}, {name:"Dîner", from:"19:00", to:"22:30", duration:120, interval:15}] },
  Mercredi: { open:true,  services:[{name:"Déjeuner", from:"12:00", to:"14:30", duration:90, interval:15}, {name:"Dîner", from:"19:00", to:"22:30", duration:120, interval:15}] },
  Jeudi:    { open:true,  services:[{name:"Déjeuner", from:"12:00", to:"14:30", duration:90, interval:15}, {name:"Dîner", from:"19:00", to:"22:30", duration:120, interval:15}] },
  Vendredi: { open:true,  services:[{name:"Déjeuner", from:"12:00", to:"14:30", duration:90, interval:15}, {name:"Dîner", from:"19:00", to:"23:00", duration:120, interval:15}] },
  Samedi:   { open:true,  services:[{name:"Brunch",   from:"11:00", to:"15:00", duration:90, interval:15}, {name:"Dîner", from:"19:00", to:"23:00", duration:120, interval:15}] },
  Dimanche: { open:false, services:[] },
};

// Activity feed (live notifications)
const ACTIVITY = [
  { id:1, kind:"new",    text:"Nouvelle réservation — Inès Faure · ce soir 20h · 2 pers.", time:"il y a 2 min", source:"widget" },
  { id:2, kind:"new",    text:"Nouvelle réservation — Maxime Robin · ce soir 20h15 · 4 pers.", time:"il y a 14 min", source:"phone" },
  { id:3, kind:"agent",  text:"Claude a confirmé Julien Moreau · 19h45 · 6 pers.", time:"il y a 37 min", source:"agent" },
  { id:4, kind:"cancel", text:"Annulation — Pauline Leroy · 12h30 · 2 pers.", time:"il y a 1 h", source:"widget" },
  { id:5, kind:"new",    text:"Camille Roux a réservé · demain 19h · 2 pers.", time:"il y a 2 h", source:"widget" },
];

window.RESTAURANT = RESTAURANT;
window.TODAY_DATE = TODAY_DATE;
window.RESERVATIONS_TODAY = RESERVATIONS_TODAY;
window.TABLES = TABLES;
window.DAYS = DAYS;
window.HOURS = HOURS;
window.ACTIVITY = ACTIVITY;
