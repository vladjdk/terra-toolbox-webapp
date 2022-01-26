import { RecoilRoot } from "recoil";
import { useInitAddress, useInitNetwork } from "data/init";
import { AppBar, createTheme, Toolbar, Typography, ThemeProvider } from '@mui/material';
import CssBaseline from "@mui/material/CssBaseline";
import { Home } from 'components/Home';
import { FreeWilly } from 'components/free-willy/FreeWilly';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'components/Wallet';
import Icons from "Icons";

const RecoilInit = () => {
  useInitAddress();
  useInitNetwork();
  return <></>;
};

export function Main() {
  const navigate = useNavigate();

  const theme = createTheme({
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
        primary: 'rgba(255,255,255,0.87)',
        secondary: 'rgba(255,255,255,0.60)'
      }
    }
  });

  return (
    <RecoilRoot>
      <RecoilInit />
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Icons/>
        <AppBar position="static" sx={{
          borderWidth: '0px 0px 1px 0px',
          borderStyle: 'solid',
          borderColor: 'primary.dark'
        }}>
          <Toolbar>
            <svg width="32" height="32">
                <use href="#free-willy"/>
            </svg>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
              Terra Toolbox
            </Typography>
            <Wallet/>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="freewilly" element={<FreeWilly/>} />
          <Route path="*" element={<Navigate replace to="/"/>}/>
        </Routes>
      </ThemeProvider>
    </RecoilRoot>
  );
}
