export const breakpoints = {
    mobile: { max: 530 },
    // mobile : @media (max-width: ${screen.mobile.max}px)
    tablet: { min: 531, max: 830 },
    // tablet : @media (min-width: ${screen.tablet.min}px) and (max-width: ${screen.tablet.max}px)
    pc: { min: 831, max: 1439 },
    // pc : @media (min-width: ${screen.pc.min}px)
    monitor: { min: 1440 },
    // monitor : @media (min-width: ${screen.pc.min}px) and (max-width: ${screen.pc.max}px)
    // huge monitor : @media (min-width: ${screen.monitor.min}px)
  } as const;
  
  export const imageURL = (symbol: string): string | undefined => {
    switch (symbol) {
      case 'UST':
      case 'AUT':
      case 'CAT':
      case 'CHT':
      case 'CNT':
      case 'DKT':
      case 'EUT':
      case 'GBT':
      case 'HKT':
      case 'IDT':
      case 'JPT':
      case 'MNT':
      case 'NOT':
      case 'PHT':
      case 'SDT':
      case 'SET':
      case 'SGT':
      case 'THT':
      case 'KRT':
        return `https://assets.terra.money/icon/60/${symbol}.png`;
      case 'LUNA':
        return `https://assets.terra.money/icon/60/Luna.png`;
      case 'bLUNA':
      case 'aUST':
      case 'bETH':
      case 'ANC':
        return `https://whitelist.anchorprotocol.com/logo/${symbol}.png`;
      case 'MIR':
        return `https://whitelist.mirror.finance/icon/${symbol}.png`;
      case 'NEB':
        return `https://assets.neb.money/icons/${symbol}.png`;
      default:
        return undefined;
    }
  };
