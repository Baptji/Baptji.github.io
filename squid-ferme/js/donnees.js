'use strict';
/* Cultures du jeu.
   rdt     : rendement moyen en France, tonnes de produit récolté par hectare (grain sec pour céréales,
             légumineuses sèches et tournesol ; produit frais pour le reste). Ordres de grandeur Agreste,
             FranceAgriMer, guides techniques maraîchers.
   kcal    : énergie pour 100 g de produit cru (table CIQUAL de l'ANSES, USDA à défaut).
   cycle   : jours entre le semis (ou la plantation) et la récolte.
   semis   : mois où l'on peut semer ou planter (1 = janvier).
   prix    : prix de base payé au producteur, € par kg.
   graine  : semences ou plants pour une case de 100 m², en €.
   demande : ce que le marché absorbe sans faire baisser le prix, kg par mois.
   azote   : fertilité prise au sol par une récolte (négatif = légumineuse qui en rend).
   conserv : jours de conservation en grange.
   forme, coul : dessin de la plante (f feuillage, c clair, m mûr, a accent). */
const CULTURES = [
  // Céréales
  { id: 'ble', nom: 'Blé tendre', cat: 'Céréales', famille: 'poacée', forme: 'epi',
    rdt: 7.0, kcal: 335, cycle: 270, semis: [10, 11], prix: 0.22, graine: 1.5, demande: 50000, azote: 18, conserv: 720,
    coul: { f: '#5f9e3a', c: '#8fbf55', m: '#d6b04a', a: '#ecd078' } },
  { id: 'orge', nom: 'Orge de printemps', cat: 'Céréales', famille: 'poacée', forme: 'epi',
    rdt: 6.0, kcal: 345, cycle: 130, semis: [2, 3], prix: 0.20, graine: 1.4, demande: 50000, azote: 15, conserv: 720,
    coul: { f: '#6aa548', c: '#9cc76a', m: '#cfb867', a: '#f0e2a0' } },
  { id: 'seigle', nom: 'Seigle', cat: 'Céréales', famille: 'poacée', forme: 'epi',
    rdt: 5.0, kcal: 335, cycle: 290, semis: [9, 10], prix: 0.20, graine: 1.4, demande: 30000, azote: 12, conserv: 720,
    coul: { f: '#5b9150', c: '#88b07a', m: '#b9a274', a: '#8f8466' } },
  { id: 'mais', nom: 'Maïs grain', cat: 'Céréales', famille: 'poacée', forme: 'mais',
    rdt: 9.0, kcal: 365, cycle: 165, semis: [4, 5], prix: 0.19, graine: 2.5, demande: 50000, azote: 25, conserv: 720,
    coul: { f: '#4f9a3a', c: '#7cc05a', m: '#bfa66a', a: '#f0c43c' } },
  { id: 'sarrasin', nom: 'Sarrasin', cat: 'Céréales', famille: 'polygonacée', forme: 'sarrasin',
    rdt: 1.5, kcal: 343, cycle: 100, semis: [5, 6, 7], prix: 1.0, graine: 0.8, demande: 800, azote: 5, conserv: 720,
    coul: { f: '#5d9a45', c: '#f3e3ea', m: '#8a4a3a', a: '#b8564a' } },
  // Légumineuses
  { id: 'haricot', nom: 'Haricot sec', cat: 'Légumineuses', famille: 'fabacée', forme: 'legume',
    rdt: 2.2, kcal: 330, cycle: 110, semis: [5, 6], prix: 2.5, graine: 3, demande: 500, azote: -12, conserv: 720,
    coul: { f: '#4e9440', c: '#f4f1e2', m: '#c2a86e', a: '#8a6a3a' } },
  { id: 'lentille', nom: 'Lentille', cat: 'Légumineuses', famille: 'fabacée', forme: 'legume',
    rdt: 1.6, kcal: 350, cycle: 120, semis: [3, 4], prix: 1.6, graine: 1.5, demande: 500, azote: -15, conserv: 720,
    coul: { f: '#6a9e4c', c: '#dfe6f5', m: '#bfa877', a: '#7d8a4a' } },
  { id: 'pois', nom: 'Petit pois', cat: 'Légumineuses', famille: 'fabacée', forme: 'legume',
    rdt: 7.5, kcal: 80, cycle: 90, semis: [2, 3, 4], prix: 0.8, graine: 2.5, demande: 400, azote: -12, conserv: 5,
    coul: { f: '#5aa548', c: '#f6f6ee', m: '#6fbf4a', a: '#8fd060' } },
  // Racines et tubercules
  { id: 'pdt', nom: 'Pomme de terre', cat: 'Racines et tubercules', famille: 'solanacée', forme: 'pdt',
    rdt: 43, kcal: 80, cycle: 110, semis: [3, 4, 5], prix: 0.30, graine: 22, demande: 3000, azote: 22, conserv: 240,
    coul: { f: '#3f8a3a', c: '#5fa84f', m: '#b5a24a', a: '#e8e0f0' } },
  { id: 'topinambour', nom: 'Topinambour', cat: 'Racines et tubercules', famille: 'astéracée', forme: 'topi',
    rdt: 30, kcal: 73, cycle: 210, semis: [3, 4], prix: 1.0, graine: 18, demande: 250, azote: 10, conserv: 30,
    coul: { f: '#4f9440', c: '#78b85a', m: '#8a6d45', a: '#f2c230' } },
  { id: 'carotte', nom: 'Carotte', cat: 'Racines et tubercules', famille: 'apiacée', forme: 'racine',
    rdt: 55, kcal: 36, cycle: 100, semis: [3, 4, 5, 6, 7], prix: 0.45, graine: 4, demande: 1500, azote: 10, conserv: 150,
    coul: { f: '#4f9e3a', c: '#7cc456', m: '#ee8a2a', a: '#4f9e3a' } },
  { id: 'panais', nom: 'Panais', cat: 'Racines et tubercules', famille: 'apiacée', forme: 'racine',
    rdt: 25, kcal: 70, cycle: 150, semis: [3, 4, 5], prix: 1.2, graine: 3, demande: 400, azote: 12, conserv: 90,
    coul: { f: '#5c9a42', c: '#86bb62', m: '#efe2b8', a: '#5c9a42' } },
  { id: 'betterave', nom: 'Betterave rouge', cat: 'Racines et tubercules', famille: 'chénopodiacée', forme: 'racine',
    rdt: 40, kcal: 43, cycle: 100, semis: [4, 5, 6], prix: 0.5, graine: 2.5, demande: 600, azote: 15, conserv: 150,
    coul: { f: '#3f7f3a', c: '#5e9a4a', m: '#8a1f3a', a: '#b0304f' } },
  { id: 'oignon', nom: 'Oignon', cat: 'Racines et tubercules', famille: 'alliacée', forme: 'bulbe',
    rdt: 45, kcal: 40, cycle: 150, semis: [2, 3, 4], prix: 0.40, graine: 9, demande: 1200, azote: 12, conserv: 240,
    coul: { f: '#4f9a4a', c: '#c9c26a', m: '#d9a45a', a: '#e8d0a0' } },
  { id: 'ail', nom: 'Ail', cat: 'Racines et tubercules', famille: 'alliacée', forme: 'bulbe',
    rdt: 9, kcal: 140, cycle: 240, semis: [10, 11], prix: 3.5, graine: 40, demande: 100, azote: 10, conserv: 270,
    coul: { f: '#5a9a5a', c: '#cdc47a', m: '#f2ece0', a: '#d8c8e0' } },
  // Légumes-feuilles
  { id: 'laitue', nom: 'Laitue', cat: 'Légumes-feuilles', famille: 'astéracée', forme: 'rosette',
    rdt: 30, kcal: 15, cycle: 55, semis: [3, 4, 5, 6, 7, 8, 9], prix: 1.0, graine: 12, demande: 400, azote: 8, conserv: 7,
    coul: { f: '#6cbf4a', c: '#b5e27a', m: '#9ad860', a: '#d6f09a' } },
  { id: 'chou', nom: 'Chou pommé', cat: 'Légumes-feuilles', famille: 'brassicacée', forme: 'chou',
    rdt: 45, kcal: 27, cycle: 120, semis: [4, 5, 6, 7], prix: 0.45, graine: 10, demande: 700, azote: 25, conserv: 90,
    coul: { f: '#4f8a78', c: '#a9d2a0', m: '#c7e2b0', a: '#7fae94' } },
  { id: 'epinard', nom: 'Épinard', cat: 'Légumes-feuilles', famille: 'chénopodiacée', forme: 'rosette',
    rdt: 20, kcal: 23, cycle: 50, semis: [3, 4, 8, 9], prix: 1.8, graine: 3, demande: 200, azote: 12, conserv: 5,
    coul: { f: '#2f7a3a', c: '#4e9a4a', m: '#3d8a42', a: '#62ad55' } },
  // Légumes-fruits
  { id: 'tomate', nom: 'Tomate (plein champ)', cat: 'Légumes-fruits', famille: 'solanacée', forme: 'tomate',
    rdt: 60, kcal: 18, cycle: 120, semis: [5], prix: 1.3, graine: 35, demande: 900, azote: 20, conserv: 10,
    coul: { f: '#3f8a3a', c: '#6aad4f', m: '#d8402a', a: '#8cc34a' } },
  { id: 'courgette', nom: 'Courgette', cat: 'Légumes-fruits', famille: 'cucurbitacée', forme: 'courgette',
    rdt: 40, kcal: 17, cycle: 80, semis: [5, 6], prix: 0.9, graine: 6, demande: 700, azote: 18, conserv: 10,
    coul: { f: '#3f8a3a', c: '#7cbf5a', m: '#2f6a2a', a: '#f4c430' } },
  { id: 'potiron', nom: 'Potiron', cat: 'Légumes-fruits', famille: 'cucurbitacée', forme: 'courge',
    rdt: 25, kcal: 26, cycle: 140, semis: [5, 6], prix: 0.6, graine: 4, demande: 600, azote: 18, conserv: 180,
    coul: { f: '#4a8f3a', c: '#78b85a', m: '#e07b24', a: '#f4c430' } },
  // Oléagineux
  { id: 'tournesol', nom: 'Tournesol', cat: 'Oléagineux', famille: 'astéracée', forme: 'tournesol',
    rdt: 2.3, kcal: 580, cycle: 150, semis: [4, 5], prix: 0.45, graine: 1.5, demande: 50000, azote: 12, conserv: 365,
    coul: { f: '#4f9440', c: '#78b85a', m: '#f2c230', a: '#5a3a1a' } },
];

const CATEGORIES = ['Céréales', 'Légumineuses', 'Racines et tubercules', 'Légumes-feuilles', 'Légumes-fruits', 'Oléagineux'];

const CULTURE = Object.fromEntries(CULTURES.map(c => [c.id, c]));

// Énergie produite par hectare et par cycle, en kcal
const kcalParHa = c => c.rdt * 1e6 * c.kcal / 100;
