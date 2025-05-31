import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, RoleBasedRoute } from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Login } from './pages/auth/Login';
import { BookList } from './pages/books/BookList';
import { BookView } from './pages/books/BookView';
import { BookForm } from './pages/books/BookForm';
import { OrderList } from './pages/orders/OrderList';
import { OrderDetail } from './pages/orders/OrderDetail';
import { OrderForm } from './pages/orders/OrderCreate';
import { StockReport } from './pages/reports/StockReport';
import { FinancialReport } from './pages/reports/FinancialReport';
import { OrderStatusReport } from './pages/reports/OrderStatusReport';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import ErrorBoundary from './ErrorBoundary';
import UserList from './pages/users/UserList';
import AddUser from './pages/users/AddUser';
import SheetDataComponent from './pages/sheet/SheetDataComponent';
import { BundleList } from './pages/bundle/Bundle';
import BulkOrderUpload from './pages/orders/BulkOrderUpload';
import {ReturnReplaceList} from './pages/returnReplacement/ReturnReplaceList';
export default function App() {
   const spreadsheetId = '1PknsoEin1n_aJJt-Fzl6vLXBygv5Odo925BBznJQPdk';
  const range1 = 'Manual Order!A:Z';
  const range2 = 'Copy App Order!A:Z';
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <ErrorBoundary>
            <Navbar />
          </ErrorBoundary>
          
          <ErrorBoundary>
                <div className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              {/* <Route path="/register" element={<Register />} /> */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mannual-data" element={<SheetDataComponent spreadsheetId={spreadsheetId} range={range1} title={"Manual Order"}/>} />
                <Route path="/app-data" element={<SheetDataComponent spreadsheetId={spreadsheetId} range={range2} title={"App Order"}/>} />
                
                {/* Book routes */}
                <Route path="/books" element={<BookList />} />
                <Route path="/books/:id" element={<BookView />} />
                
                {/* Admin-only book& User routes */}
                <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
                  <Route path="/users" element={<UserList />} />
                  <Route path="/bundles" element={<BundleList />} />
                  <Route path="/users/add" element={<AddUser/>} />
                  <Route path="/users/:id" element={<AddUser/>} />
                  <Route path="/books/create" element={<BookForm />} />
                  <Route path="/books/:id/edit" element={<BookForm />} />
                </Route>

                {/* Order routes */}
                <Route element={<RoleBasedRoute allowedRoles={['executive', 'councellor','admin']} />}>
                  <Route path="/orders" element={<OrderList />} />
                  <Route path="/orders/create" element={<OrderForm />} />
                  <Route path="/orders/create-bulk" element={<BulkOrderUpload />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/orders/:orderId/edit" element={<OrderForm />} />
          
                </Route>
                {/* Return Replacement routes */}
                <Route element={<RoleBasedRoute allowedRoles={['executive', 'councellor','admin']} />}>
                  <Route path="/return-list" element={<ReturnReplaceList />} />
          
                </Route>

                {/* Report routes */}
                <Route element={<RoleBasedRoute allowedRoles={['operations_manager', 'admin']} />}>
                  <Route path="/reports/stock" element={<StockReport />} />
                  <Route path="/reports/financial" element={<FinancialReport />} />
                  <Route path="/reports/order-status" element={<OrderStatusReport />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          </ErrorBoundary>
        </Layout>

        <ErrorBoundary>
          <ToastContainer />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
