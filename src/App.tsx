import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import RawMaterial from '@/pages/RawMaterial';
import Feeding from '@/pages/Feeding';
import Electrode from '@/pages/Electrode';
import Smelting from '@/pages/Smelting';
import Tapping from '@/pages/Tapping';
import Crushing from '@/pages/Crushing';
import PowerStats from '@/pages/PowerStats';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/raw-material" element={<RawMaterial />} />
          <Route path="/feeding" element={<Feeding />} />
          <Route path="/electrode" element={<Electrode />} />
          <Route path="/smelting" element={<Smelting />} />
          <Route path="/tapping" element={<Tapping />} />
          <Route path="/crushing" element={<Crushing />} />
          <Route path="/power-stats" element={<PowerStats />} />
        </Routes>
      </Layout>
    </Router>
  );
}
