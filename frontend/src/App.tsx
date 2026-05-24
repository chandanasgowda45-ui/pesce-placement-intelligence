import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import CandidateAnalyzer from "./pages/CandidateAnalyzer";
import RejectionProbability from "./pages/RejectionProbability";
import PlacementTimeline from "./pages/PlacementTimeline";
import InterviewExperiences from "./pages/InterviewExperiences";
import PlacementWarRoom from "./pages/PlacementWarRoom";
// testing automatic deployment
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
          <Route path="/companies/:companyId/skills" element={<CompanyDetailPage />} />
          <Route path="/companies/:companyId/process" element={<CompanyDetailPage />} />
          <Route path="/companies/:companyId/intelligence" element={<CompanyDetailPage />} />
          <Route path="/companies/:companyId/insights" element={<CompanyDetailPage />} />
          <Route path="/companies/:companyId/innovx" element={<CompanyDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/skill-mapping" element={<SkillMappingPage />} />
          <Route path="/landmapping" element={<SkillMappingPage />} />
          <Route path="/hiring-skill-set" element={<HiringSkillSetPage />} />
          <Route path="/hiring-process" element={<HiringProcessPage />} />
          <Route path="/innovx" element={<InnovXPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/candidate-analyzer" element={<CandidateAnalyzer />} />
          <Route path="/rejection-probability" element={<RejectionProbability />} />
          <Route path="/placement-war-room" element={<PlacementWarRoom />} />

          <Route path="/placement-timeline" element={<PlacementTimeline />} />

          <Route path="/interview-experiences" element={<InterviewExperiences />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
