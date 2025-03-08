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
import { Footer } from './features/Footer/Footer';
import { TOTPTool } from './pages/TOTP-Tool/TOTP-Tool';
import { WebAuthnTool } from './pages/WebAuthn-Tool/WebAuthn-Tool';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            
            <Route path="/" element={<NavigationBar/>}>
              <Route index element={<Home/>} />
              <Route path="password-authentication" element={<PasswordAuthentication/>} />
              <Route path="webauthn-description" element={<WebAuthnDescription/>} />
              <Route path="history" element={<History/>} />
              <Route path="totp" element={<TOTP/>} />
              <Route path="tokens" element={<Tokens/>} />
              <Route path="totp-tool" element={<TOTPTool />} />
              <Route path="webauthn-tool" element={<WebAuthnTool />} />
            </Route>
            
          </Routes>
        </BrowserRouter>
      </header>
      <footer>
      <Footer />
      </footer>
    </div>
  );
}

export default App;
