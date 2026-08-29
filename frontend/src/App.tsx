import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import CompaniesPage from "./pages/CompaniesPage";
import CategoriesPage from "./pages/CategoriesPage";
import SkillMappingPage from "./pages/SkillMappingPage";
import ComparePage from "./pages/ComparePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import HiringSkillSetPage from "./pages/HiringSkillSetPage";
import HiringProcessPage from "./pages/HiringProcessPage";
import InnovXPage from "./pages/InnovXPage";
import ExplorePage from "./pages/ExplorePage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import NotFound from "./pages/NotFound";
import RejectionProbability from "./pages/RejectionProbability";
import PlacementTimeline from "./pages/PlacementTimeline";
import InterviewExperiences from "./pages/InterviewExperiences";
import PlacementWarRoom from "./pages/PlacementWarRoom";
import StudentDashboard from "./pages/StudentDashboard";
import StudentPlacementTimeline from "./pages/StudentPlacementTimeline";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/auth/LoginPage";
import CreateAccountPage from "./pages/auth/CreateAccountPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
// testing automatic deployment
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public auth routes - redirect if already logged in */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/create-account" element={
              <PublicRoute>
                <CreateAccountPage />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected routes - redirect to login if not authenticated */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/companies" element={
              <ProtectedRoute>
                <CompaniesPage />
              </ProtectedRoute>
            } />
            <Route path="/explore" element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            } />
            <Route path="/companies/:companyId" element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/companies/:companyId/skills" element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/companies/:companyId/process" element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/companies/:companyId/intelligence" element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/companies/:companyId/insights" element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/companies/:companyId/innovx" element={
              <ProtectedRoute>
                <CompanyDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute>
                <ComparePage />
              </ProtectedRoute>
            } />
            <Route path="/skill-mapping" element={
              <ProtectedRoute>
                <SkillMappingPage />
              </ProtectedRoute>
            } />
            <Route path="/landmapping" element={
              <ProtectedRoute>
                <SkillMappingPage />
              </ProtectedRoute>
            } />
            <Route path="/hiring-skill-set" element={
              <ProtectedRoute>
                <HiringSkillSetPage />
              </ProtectedRoute>
            } />
            <Route path="/hiring-process" element={
              <ProtectedRoute>
                <HiringProcessPage />
              </ProtectedRoute>
            } />
            <Route path="/innovx" element={
              <ProtectedRoute>
                <InnovXPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/rejection-probability" element={
              <ProtectedRoute>
                <RejectionProbability />
              </ProtectedRoute>
            } />
            <Route path="/placement-war-room" element={
              <ProtectedRoute>
                <PlacementWarRoom />
              </ProtectedRoute>
            } />
            <Route path="/placement-timeline" element={
              <ProtectedRoute>
                <PlacementTimeline />
              </ProtectedRoute>
            } />
            <Route path="/interview-experiences" element={
              <ProtectedRoute>
                <InterviewExperiences />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student-timeline" element={
              <ProtectedRoute>
                <StudentPlacementTimeline />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
