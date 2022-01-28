import { createTheme } from '@mui/material';

export const primaryTextColor = 'rgba(255,255,255,0.87)';
export const secondaryTextColor = 'rgba(255,255,255,0.60)';

export const theme =  createTheme({
    palette: {
      primary: {
        main: '#1c1c1c',
        light: '#262627',
        dark: '#000000'
      },
      secondary: {
        main: '#2f81f4',
      },
      background: {
        default: '#323233',
        paper: '#434343',
      },
      text: {
        primary: primaryTextColor,
        secondary: secondaryTextColor
      },
      action: {
        disabled: secondaryTextColor
      }
    }
  });