import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "@radix-ui/themes/styles.css";

import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { Home } from './features/Home/Home';
import { NavigationBar } from './features/NavigationBar/NavigationBar';
import { Footer } from './features/Footer/Footer';
import { TOTPTool } from './features/TOTP-Tool/TOTP-Tool';
import { WebAuthnTool } from './features/WebAuthn-Tool/WebAuthn-Tool';

import { Theme } from "@radix-ui/themes";

function App() {
  return (
    <Theme>
      <div className="App"> 
        <header className="App-header">
          <BrowserRouter>
            <Routes>
              
              <Route path="/" element={<NavigationBar/>}>
                <Route index element={<Home/>} />
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
    </Theme>
  );
}

export default App;
