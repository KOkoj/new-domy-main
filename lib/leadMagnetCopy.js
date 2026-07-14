export const LEAD_MAGNET_COPY = {
  mistakes: {
    cs: {
      headline: 'Plánujete koupi nemovitosti v Itálii?',
      description:
        'Stáhněte si zdarma praktický přehled nejčastějších chyb, které kupující často přehlédnou dřív, než podepíší smlouvu.',
      cta: 'Získat PDF zdarma'
    },
    en: {
      headline: 'Planning to buy property in Italy?',
      description:
        'Download a free practical overview of the most common mistakes buyers overlook before signing a contract.',
      cta: 'Get the free PDF'
    },
    it: {
      headline: 'Stai pianificando l’acquisto di un immobile in Italia?',
      description:
        'Scarica gratuitamente una panoramica pratica degli errori più comuni che gli acquirenti spesso trascurano prima di firmare.',
      cta: 'Ottieni il PDF gratuito'
    }
  },
  inspections: {
    cs: {
      headline: 'Chystáte se na prohlídku nemovitosti v Itálii?',
      description:
        'Stáhněte si zdarma průvodce, který vám pomůže připravit se na prohlídku a odhalit rizika dřív, než se stanou problémem.',
      cta: 'Získat PDF zdarma'
    },
    en: {
      headline: 'Preparing for a property viewing in Italy?',
      description:
        'Download a free guide that helps you prepare for viewings and spot risks before they become costly problems.',
      cta: 'Get the free PDF'
    },
    it: {
      headline: 'Ti stai preparando a visitare un immobile in Italia?',
      description:
        'Scarica gratuitamente una guida che ti aiuta a prepararti alle visite e individuare i rischi prima che diventino problemi costosi.',
      cta: 'Ottieni il PDF gratuito'
    }
  }
}

export function getLeadMagnetCopy(assetKey, language = 'cs') {
  const assetCopy = LEAD_MAGNET_COPY[assetKey]
  if (!assetCopy) return null
  return assetCopy[language] || assetCopy.cs
}
