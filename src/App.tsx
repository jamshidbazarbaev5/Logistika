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
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import PhotoUpload from "./pages/PhotoUpload";
import ModeCreate from "./pages/ModeCreate";
import CreateApplication from "./pages/CreateApplication";
import CreateProduct from "./pages/CreateProduct";
import CreateProductQuantity from "./pages/CreateProductQuantity";
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
import ApplicationList from "./pages/ApplicationList";
import ProductsList from "./pages/ProductsList";
import UpdateUser from "./pages/UpdataUser";
import UserList from "./pages/UserList";
import KeepingServiceList from './pages/KeepingServiceList'
import CreateKeepingService from './pages/CreateKeepingService'
import WorkingServiceList from './pages/WorkinServiceList'
import CreateWorkingService from './pages/CreateWorkingService'
import EditApplication from "./pages/EditApplication";
import CreateKeepingServicePrice from './pages/CreateKeepingService'
import CalculateServices from "./pages/CalculateServices";
import TransactionPage from "./pages/TransactionPage";
import { Provider } from "react-redux";
import store from "./storage/storage";
import ArchiveApplicationList from "./pages/ArchiveApplicationList";
import ArchiveApplicationShowDetails from "./pages/ArchiveApplicationShowDetails";
const queryClient = new QueryClient();

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Provider store={store}>
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
                <Route path="/" element={<Navigate to="/application-list" replace />} />
                <Route path="/application-list" element={<ApplicationList />} />
                <Route path="/categories/create" element={<CreateItemCategory />} />
                <Route path="/category" element={<CategoryList />} />
                <Route path="/create-application" element={<CreateApplication />} />
                <Route path="/edit-application/:id" element={<EditApplication />} />
                <Route path="/firm-list" element={<FirmList />} />
                <Route path="/firms" element={<CreateFirm />} />
                <Route path="/keeping-services" element={<KeepingServiceList />} />
                <Route path="/keeping-services/create" element={<CreateKeepingService />} />
                <Route path="/keeping-services/create-price" element={<CreateKeepingServicePrice />} />
                <Route path="/measurements" element={<MeasurementList />} />
                <Route path="/measurements/create" element={<CreateMeasurement />} />
                <Route path="/modes" element={<ModeList />} />
                <Route path="/modes/create" element={<ModeCreate />} />
                <Route path="/payment-list" element={<PaymentList />} />
                <Route path="/payment-methods/create" element={<CreatePaymentMethod />} />
                <Route path="/photo-report" element={<PhotoUpload />} />
                <Route path="/products-list" element={<ProductsList />} />
                <Route path="/products/create" element={<CreateProduct />} />
                <Route path="/product-quantity" element={<CreateProductQuantity />} />
                <Route path="/storage-list" element={<StorageList />} />
                <Route path="/storages/create" element={<CreateStorage />} />
                <Route path="/transport/create" element={<TransportForm />} />
                <Route path="/transport-list" element={<TransportList />} />
                <Route path="/transport/number/create" element={<CreateTransportNumber />} />
                <Route path="/update-user" element={<UpdateUser />} />
                <Route path="/user-list" element={<UserList />} />
                <Route path="/working-services" element={<WorkingServiceList />} />
                <Route path="/working-services/create" element={<CreateWorkingService />} />
                <Route path="/working-services/edit/:id" element={<CreateWorkingService />} />
                <Route path="/calculate-services/:id" element={<CalculateServices/>}/>
                <Route path="/transaction/:id" element={<TransactionPage/>}/>
                <Route path="/transaction" element={<TransactionPage/>}/>
                <Route path="/archive-application-list" element={<ArchiveApplicationList/>}/>
                <Route path="/archive/:id" element={<ArchiveApplicationShowDetails/>}/>
              </Route>
            </Routes>
          </Router>
        </QueryClientProvider>
      </Provider>
    </div>
  );
}

export default App;
