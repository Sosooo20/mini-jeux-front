// Phrases de test : le ton et les thèmes définitifs viendront plus tard

export type JamaisKind = 'jamais' | 'deja'

export interface JamaisCard {
  kind: JamaisKind
  text: string
}

/** Qui boit, selon la sorte de phrase */
export const WHO_DRINKS: Record<JamaisKind, string> = {
  jamais: "Ceux qui l'ont déjà fait boivent",
  deja: "Ceux qui ne l'ont jamais fait boivent",
}

export const JAMAIS_CARDS: JamaisCard[] = [
  { kind: 'jamais', text: "Je n'ai jamais menti sur mon âge." },
  { kind: 'jamais', text: "Je n'ai jamais envoyé un message à la mauvaise personne." },
  { kind: 'jamais', text: "Je n'ai jamais fait semblant d'être malade pour éviter une soirée." },
  { kind: 'jamais', text: "Je n'ai jamais stalké un ex sur les réseaux." },
  { kind: 'jamais', text: "Je n'ai jamais dormi plus de 14 heures d'affilée." },
  { kind: 'jamais', text: "Je n'ai jamais pleuré devant un dessin animé." },
  { kind: 'deja', text: "J'ai déjà chanté au karaoké." },
  { kind: 'deja', text: "J'ai déjà raté un train ou un avion." },
  { kind: 'deja', text: "J'ai déjà oublié l'anniversaire d'un proche." },
  { kind: 'deja', text: "J'ai déjà fait une nuit blanche." },
  { kind: 'deja', text: "J'ai déjà dansé sur une table." },
  { kind: 'deja', text: "J'ai déjà été recalé à l'entrée d'une boîte." },
]
