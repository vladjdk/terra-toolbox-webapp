import React, { useMemo } from 'react';
import { imageURL } from './env';

export interface TokenIconProps {
  className?: string;
  symbol?: string;
}

export function TokenIcon({ symbol = '' }: TokenIconProps) {
  const placeholder = useMemo(() => {
    const fontColor = 'eeedee';
    const background = '685f75';

    return `https://ui-avatars.com/api/?rounded=true&size=128&name=${symbol}&color=${fontColor}&background=${background}&length=4&?format=svg&font-size=0.3`;
  }, [symbol]);

  return <img src={imageURL(symbol) ?? placeholder} alt={symbol ?? 'icon'} />;
}
