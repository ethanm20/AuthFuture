import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { PasswordAuthentication } from './pages/PasswordAuthentication/PasswordAuthentication';
import { WebAuthnDescription } from './pages/WebAuthnDescription/WebAuthnDescription';
import { Home } from './pages/Home/Home';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AuthFuture</h1>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}>
              <Route path="password-authenticcation" element={<PasswordAuthentication/>} />
              <Route path="webauthn-description" element={<WebAuthnDescription/>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </header>
      <p>More coming soon...</p>
    </div>
  );
}

export default App;
