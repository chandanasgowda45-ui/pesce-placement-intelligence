import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/hooks/useAuth';

const CandidateAnalyzer = () => {
  const { user } = useAuth();
  const [report, setReport] = useState<any>({
    name: "",
    cgpa: "",
    skills: "",
    projects: "",
    resume: ""
  });
  const [loading, setLoading] = useState(false);

  const runAnalysis = async (formData: any) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${API_URL}/api/analyze-candidate`, formData);
      setReport(res.data);

      // Minimal Safe Persistence: Save if authenticated
      if (user?.id && res.data && res.data.selectionProbability !== undefined) {
        await supabase.from('student_audits').insert([{
          student_id: user.id,
          company_id: formData.targetCompany || "General",
          target_role: formData.targetRole || "SDE",
          selection_probability: res.data.selectionProbability || 0,
          rejection_risk: res.data.rejectionRisk || "Medium",
          readiness_level: res.data.readinessLevel || "Intermediate",
          weak_skills: res.data.missingSkills || [],
          roadmap: res.data.roadmapRecommendations || {},
          audit_payload: res.data
        }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Analysis UI logic here */}

      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-black">Candidate Analyzer</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setReport((prev: any) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />

          <input
            type="number"
            placeholder="CGPA"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setReport((prev: any) => ({
                ...prev,
                cgpa: e.target.value,
              }))
            }
          />
        </div>

        <textarea
          placeholder="Skills"
          className="border p-3 rounded-lg w-full min-h-[100px]"
          onChange={(e) =>
            setReport((prev: any) => ({
              ...prev,
              skills: e.target.value,
            }))
          }
        />

        <textarea
          placeholder="Projects"
          className="border p-3 rounded-lg w-full min-h-[100px]"
          onChange={(e) =>
            setReport((prev: any) => ({
              ...prev,
              projects: e.target.value,
            }))
          }
        />

        <textarea
          placeholder="Resume Summary"
          className="border p-3 rounded-lg w-full min-h-[120px]"
          onChange={(e) =>
            setReport((prev: any) => ({
              ...prev,
              resume: e.target.value,
            }))
          }
        />

        <button
          onClick={() => runAnalysis(report)}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold"
        >
          {loading ? "Analyzing..." : "Analyze Candidate"}
        </button>
      </Card>
    </div>
  );
};

export default CandidateAnalyzer;