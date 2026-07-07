import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories";
import Stock from "./pages/Stock";
import Sales from "./pages/Sales";
import Financial from "./pages/Financial";
import Companies from "./pages/Companies";
import Reports from "./pages/Reports";
import PrivateRoute from "./routes/PrivateRoute";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Purchases from "./pages/Purchases";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
          </PrivateRoute>
          }
        />
          
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <PrivateRoute>
              <Stock />
            </PrivateRoute>
          }
        />

        <Route
          path="/purchases"
          element={
             <PrivateRoute>
               <Purchases />
             </PrivateRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <Sales />
            </PrivateRoute>
          }
        />

        <Route
          path="/financial"
          element={
            <PrivateRoute>
              <Financial />
            </PrivateRoute>
          }
        />

        <Route
          path="/companies"
          element={
            <PrivateRoute>
              <Companies />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;