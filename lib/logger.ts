import { Axiom } from '@axiomhq/js'

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
})

export const AXIOM_DATASET = process.env.AXIOM_DATASET ?? 'studybug-production'
