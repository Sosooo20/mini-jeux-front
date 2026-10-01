export interface PalmierCard {
  /** Valeur affichée dans le coin de la carte */
  value: string
  suit: '♠' | '♥' | '♦' | '♣'
  title: string
  rule: string
  example?: string
}

export const PALMIER_CARDS: PalmierCard[] = [
  {
    value: 'A',
    suit: '♠',
    title: 'Cul sec',
    rule: 'Le joueur qui a pioché la carte doit boire son verre cul sec !',
  },
  {
    value: '2·3',
    suit: '♥',
    title: 'Distribue 2 ou 3',
    rule: "Le joueur qui tire la carte distribue autant de gorgées que l'indique sa carte aux joueurs de son choix. Il peut aussi toutes les donner à un seul joueur.",
  },
  {
    value: '4',
    suit: '♣',
    title: 'Four to the floor',
    rule: 'Tous les joueurs doivent dire « Four to the floor » avec le doigt vers le bas. Le dernier doit boire une gorgée.',
  },
  {
    value: '5',
    suit: '♦',
    title: 'Five to the sky',
    rule: 'Tous les joueurs doivent dire « Five to the sky » avec le doigt vers le haut. Le dernier doit boire une gorgée.',
  },
  {
    value: '6',
    suit: '♠',
    title: 'Dans ma valise',
    rule: "Le joueur qui tire la carte doit dire « Dans ma valise il y a » et ajouter le mot de son choix. Le joueur suivant répète la même chose et ajoute à son tour un mot de son choix. Et ainsi de suite jusqu'à ce que quelqu'un se trompe. Celui qui perd boit une gorgée.",
    example:
      '« Dans ma valise il y a un ornithorynque » → « … un ornithorynque et une éolienne » → « … un ornithorynque, une éolienne et sa sœur »…',
  },
  {
    value: '7',
    suit: '♥',
    title: 'Maître de la question',
    rule: "Dès que le joueur qui a tiré cette carte pose une question durant le jeu, toutes les personnes qui y répondent doivent boire. Mais si un joueur répond « Ta gueule ! », c'est le maître qui boit. La règle s'applique jusqu'à ce qu'un autre 7 soit tiré.",
  },
  {
    value: '8',
    suit: '♣',
    title: 'Distribue 8',
    rule: 'Le joueur qui tire un 8 peut distribuer 8 gorgées. Il peut les répartir, ou pas !',
  },
  {
    value: '9',
    suit: '♦',
    title: "J'ai déjà / J'ai jamais",
    rule: "Le joueur qui tire cette carte raconte quelque chose qu'il a déjà fait ou qu'il n'a jamais fait. S'il l'a déjà fait, ceux qui ne l'ont jamais fait boivent. Et inversement, s'il ne l'a jamais fait, ceux qui l'ont fait boivent.",
  },
  {
    value: '10',
    suit: '♠',
    title: 'Le maître du freeze',
    rule: "Le joueur qui a pioché la carte devient maître du freeze. À tout moment, il peut s'arrêter de bouger et tous les joueurs doivent en faire autant. Le dernier qui s'arrête boit une gorgée.",
  },
  {
    value: 'V',
    suit: '♥',
    title: 'Le thème',
    rule: "Le joueur qui tire la carte choisit un thème (marques de chaussures, groupes de rock, parcs d'attraction…) et donne la première réponse. Le joueur suivant donne une réponse à son tour, et ainsi de suite. Celui qui ne trouve pas boit !",
  },
  {
    value: 'D',
    suit: '♣',
    title: 'À la tienne tout le monde',
    rule: 'Tout le monde boit une gorgée !',
  },
  {
    value: 'R',
    suit: '♦',
    title: 'Invente une règle',
    rule: 'La meilleure carte du jeu : le joueur qui tire un roi invente une règle de son choix. Par exemple : doubler toutes les gorgées reçues…',
  },
]
