import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "../src/layout/layout";
import TransportForm from "./pages/TransportForm";
import "./App.css";
import CreateFirm from "./pages/CreateFirm";
import KeepingService from "./pages/KeepingService";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import PhotoUpload from "./pages/PhotoUpload";
import ModeCreate from "./pages/ModeCreate";
import CreateApplication from "./pages/CreateApplication";
import CreateProduct from "./pages/CreateProduct";
import CreateProductQuantity from "./pages/CreateProductQuantity";
import WorkingService from "./pages/WorkingService";
import FirmList from "./pages/FirmList";
import CreatePaymentMethod from "./pages/CreatePaymentMethod";
import CreateItemCategory from "./pages/CreateItemCategory";
import TransportList from "./pages/TransportList";
import CreateTransportNumber from "./pages/CreateTransportNumber";
import MeasurementList from "./pages/MeasurmentList";
import CreateMeasurement from "./pages/MeasurmentPage";
import CategoryList from "./pages/CategoryList";
import StorageList from "./pages/StorageList";
import CreateStorage from "./pages/CreateStorage";
import ModeList from "./pages/ModeList";
import PaymentList from "./pages/PaymentList";
const queryClient = new QueryClient();

function App() {
  return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >

                <Route path="/transport/create" element={<TransportForm />} />
                <Route path="/firms" element={<CreateFirm />} />
                <Route path="/storage-list" element={<StorageList />} />
                <Route path="/keeping_service" element={<KeepingService />} />
                <Route path="/photo-report" element={<PhotoUpload />} />
                <Route path="/application" element={<CreateApplication />} />
                <Route path="/" element={<Navigate to="/firm-list" replace />} />
                <Route path="/product" element={<CreateProduct />} />
                <Route path="/product-quantity" element={<CreateProductQuantity />} />
                <Route path="working_service" element={<WorkingService />} />
                <Route path="/firm-list" element={<FirmList />} />
                <Route path="/category" element={<CategoryList />} />
                <Route path="/transport-list" element={<TransportList />} />
                <Route path="/transport/number/create" element={<CreateTransportNumber />} />
                <Route path="/measurements" element={<MeasurementList />} />
                <Route path="/measurements/create" element={<CreateMeasurement />} />
                <Route path="/categories/create" element={<CreateItemCategory />} />
                <Route path="/storages/create" element={<CreateStorage />} />
                <Route path="/modes" element={<ModeList />} />
                <Route path="/modes/create" element={<ModeCreate />} />
                <Route path="/payment-list" element={<PaymentList />} />
                <Route path="/payment-methods/create" element={<CreatePaymentMethod />} />
              </Route>
            </Routes>
          </Router>
        </QueryClientProvider>
      </div>
  );
}
  
export default App;
