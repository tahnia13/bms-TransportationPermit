import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// LAYOUT
// =====================================================

import DashboardLayout from "./layouts/DashboardLayout";

// =====================================================
// PROTECTED ROUTE
// =====================================================

import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// AUTH
// =====================================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// =====================================================
// DASHBOARD
// =====================================================

import Dashboard from "./pages/Dashboard";

// =====================================================
// PERMIT
// =====================================================

import PermitList from "./pages/permit/PermitList";
import PermitCreate from "./pages/permit/PermitCreate";

// =====================================================
// VEHICLE
// =====================================================

import VehicleList from "./pages/vehicle/VehicleList";
import VehicleCreate from "./pages/vehicle/VehicleCreate";

// =====================================================
// DRIVER
// =====================================================

import DriverList from "./pages/driver/DriverList";
import DriverCreate from "./pages/driver/DriverCreate";

// =====================================================
// TRIP
// =====================================================

import TripList from "./pages/trip/TripList";
import TripCreate from "./pages/trip/TripCreate";

// =====================================================
// ARCHIVE
// =====================================================

import Archive from "./pages/archive/Archive";

// =====================================================
// REPORTS
// =====================================================

import Reports from "./pages/reports/Reports";

// =====================================================
// AUDIT LOG
// =====================================================

import AuditLog from "./pages/audit/AuditLog";
import { ToastProvider } from "./components/Toast";

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PERMIT MANAGEMENT
        ================================================= */}

        <Route
          path="/permit"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PermitList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/permit/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PermitCreate />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PERMIT OLD URL REDIRECT
        ================================================= */}

        <Route
          path="/permits"
          element={
            <Navigate
              to="/permit"
              replace
            />
          }
        />

        <Route
          path="/permits/create"
          element={
            <Navigate
              to="/permit/create"
              replace
            />
          }
        />

        <Route
          path="/permits/:id"
          element={
            <Navigate
              to="/permit"
              replace
            />
          }
        />

        <Route
          path="/permits/:id/edit"
          element={
            <Navigate
              to="/permit"
              replace
            />
          }
        />


        {/* =================================================
            VEHICLES
        ================================================= */}

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <VehicleList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <VehicleCreate />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            VEHICLE OLD EDIT URL
            Redirect ke list karena Edit sekarang Card
        ================================================= */}

        <Route
          path="/vehicles/:id"
          element={
            <Navigate
              to="/vehicles"
              replace
            />
          }
        />

        <Route
          path="/vehicles/:id/edit"
          element={
            <Navigate
              to="/vehicles"
              replace
            />
          }
        />


        {/* =================================================
            DRIVERS
        ================================================= */}

        <Route
          path="/drivers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DriverList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/drivers/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DriverCreate />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            DRIVER OLD DETAIL / EDIT URL
        ================================================= */}

        <Route
          path="/drivers/:id"
          element={
            <Navigate
              to="/drivers"
              replace
            />
          }
        />

        <Route
          path="/drivers/:id/edit"
          element={
            <Navigate
              to="/drivers"
              replace
            />
          }
        />


        {/* =================================================
            TRIPS
        ================================================= */}

        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TripList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TripCreate />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            TRIP OLD DETAIL / EDIT URL
        ================================================= */}

        <Route
          path="/trips/:id"
          element={
            <Navigate
              to="/trips"
              replace
            />
          }
        />

        <Route
          path="/trips/:id/edit"
          element={
            <Navigate
              to="/trips"
              replace
            />
          }
        />


        {/* =================================================
            DIGITAL ARCHIVE
        ================================================= */}

        <Route
          path="/archive"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Archive />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ARCHIVE OLD URL
            Sementara diarahkan kembali ke Archive List
        ================================================= */}

        <Route
          path="/archive/:id"
          element={
            <Navigate
              to="/archive"
              replace
            />
          }
        />

        <Route
          path="/archive/create"
          element={
            <Navigate
              to="/archive?action=create"
              replace
            />
          }
        />

        <Route
          path="/archive/:id/edit"
          element={
            <Navigate
              to="/archive"
              replace
            />
          }
        />

        {/* =================================================
            REPORTS
        ================================================= */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            AUDIT LOG
        ================================================= */}

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AuditLog />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            UNKNOWN PAGE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
    </ToastProvider>
  );
}


export default App;