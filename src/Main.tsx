import { RecoilRoot } from "recoil";
import { useInitAddress, useInitNetwork } from "data/init";
import { AppBar, Toolbar, Typography, ThemeProvider } from '@mui/material';
import CssBaseline from "@mui/material/CssBaseline";
import { Home } from 'components/Home';
import { FreeWilly } from 'components/free-willy/FreeWilly';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'components/Wallet';
import { theme } from 'theme';
import Icons from "Icons";

const RecoilInit = () => {
  useInitAddress();
  useInitNetwork();
  return <></>;
};

export function Main() {
  const navigate = useNavigate();


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
