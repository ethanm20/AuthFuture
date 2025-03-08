import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { PasswordAuthentication } from './pages/PasswordAuthentication/PasswordAuthentication';
import { WebAuthnDescription } from './pages/WebAuthnDescription/WebAuthnDescription';
import { Home } from './pages/Home/Home';
import { NavigationBar } from './features/NavigationBar/NavigationBar';
import { History } from './pages/History/History';
import { TOTP } from './pages/TOTP/TOTP';
import { Tokens } from './pages/Tokens/Tokens';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <Routes>
            <Route path={process.env.PUBLIC_URL + '/'} element={<NavigationBar/>}>
              <Route index element={<Home/>} />
              <Route path="password-authentication" element={<PasswordAuthentication/>} />
              <Route path="webauthn-description" element={<WebAuthnDescription/>} />
              <Route path="history" element={<History/>} />
              <Route path={process.env.PUBLIC_URL + '/totp'} element={<TOTP/>} />
              <Route path="tokens" element={<Tokens/>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </header>
      <p>More coming soon...</p>
    </div>
  );
}

export default App;
