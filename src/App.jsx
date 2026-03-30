import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Builder from './pages/Builder';
import EmailBuilder from './pages/EmailBuilder';
import Glossary from './pages/Glossary';
import History from './pages/History';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Builder />} />
          <Route path="email-builder" element={<EmailBuilder />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
