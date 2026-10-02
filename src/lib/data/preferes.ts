// Dilemmes de test : les questions et thèmes définitifs viendront plus tard

export interface Dilemma {
  a: string
  b: string
}

export const DILEMMAS: Dilemma[] = [
  { a: "Ne plus jamais boire d'alcool", b: 'Ne plus jamais manger de fromage' },
  {
    a: 'Que ton ex lise tous tes messages',
    b: 'Que tes parents voient tout ton historique internet',
  },
  { a: 'Toujours arriver 30 min en retard', b: 'Toujours arriver 1 h en avance' },
  { a: 'Pouvoir lire dans les pensées', b: 'Être invisible' },
  { a: 'Passer une soirée sans téléphone', b: 'Passer une semaine sans réseaux sociaux' },
  { a: 'Chanter à chaque fois que tu parles', b: 'Danser à chaque fois que tu marches' },
]
