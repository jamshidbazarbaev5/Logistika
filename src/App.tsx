import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../src/layout/layout'
// import Dashboard from './pages/Dashboard';
import TransportForm from './pages/TransportForm';
// import Firms from './pages/Firms';
// import Storage from './pages/Storage';
// import Payments from './pages/Payments';
import './App.css'
import CreateFirm from './pages/CreateFirm';
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/transport" element={<TransportForm />} />
            <Route path="/firms" element={<CreateFirm />} />
            {/* <Route path="/storage" element={<Storage />} /> */}
            {/* <Route path="/payments" element={<Payments />} /> */}
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;