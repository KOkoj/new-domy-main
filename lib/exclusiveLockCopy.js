// NÁVRH - neschválený text. Renderuje se jen při zapnutém
// NEXT_PUBLIC_EXCLUSIVE_GALLERY_LOCK (výchozí OFF). Před zapnutím flagu
// musí Matěj texty schválit (viz copy-for-approval.md v PR).
const COPY = {
  cs: {
    unlockButton: 'Odemknout další fotky a video',
    unlockTitle: 'Další fotky pošleme na e-mail',
    unlockHint: 'Zadejte e-mail a zbytek galerie se vám odemkne.'
  },
  en: {
    unlockButton: 'Unlock more photos and video',
    unlockTitle: 'Get the full gallery by e-mail',
    unlockHint: 'Enter your e-mail to unlock the rest of the gallery.'
  },
  it: {
    unlockButton: 'Sblocca altre foto e il video',
    unlockTitle: 'Ricevi la galleria completa via e-mail',
    unlockHint: 'Inserisci la tua e-mail per sbloccare il resto della galleria.'
  }
}

export function getExclusiveLockCopy(language) {
  return COPY[language] || COPY.cs
}
