import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

const CandidateAnalyzer = () => {
  const [report, setReport] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    cgpa: "",
    skills: "",
    projects: "",
    resume: ""
  });

  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:3001/api/analyze-candidate',
        formData
      );

      setReport(res.data);
    } catch (err) {
      console.error("Analysis Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* INPUT FORM */}
      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-black">
          Candidate Analyzer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Full Name"
            className="border p-3 rounded-lg"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
            }
          />

          <input
            type="number"
            placeholder="CGPA"
            className="border p-3 rounded-lg"
            value={formData.cgpa}
            onChange={(e) =>
              setFormData({
                ...formData,
                cgpa: e.target.value
              })
            }
          />
        </div>

        <textarea
          placeholder="Skills"
          className="border p-3 rounded-lg w-full min-h-[100px]"
          value={formData.skills}
          onChange={(e) =>
            setFormData({
              ...formData,
              skills: e.target.value
            })
          }
        />

        <textarea
          placeholder="Projects"
          className="border p-3 rounded-lg w-full min-h-[100px]"
          value={formData.projects}
          onChange={(e) =>
            setFormData({
              ...formData,
              projects: e.target.value
            })
          }
        />

        <textarea
          placeholder="Resume Summary"
          className="border p-3 rounded-lg w-full min-h-[120px]"
          value={formData.resume}
          onChange={(e) =>
            setFormData({
              ...formData,
              resume: e.target.value
            })
          }
        />

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold"
        >
          {loading ? "Analyzing..." : "Analyze Candidate"}
        </button>
      </Card>

      {/* RESULTS */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">

          {/* SCORE CARD */}
          <Card className="p-6 col-span-1 space-y-4">
            <h2 className="text-xl font-bold">
              Readiness Level
            </h2>

            <div className="text-4xl font-black text-indigo-600">
              {report.level}
            </div>

            <Progress
              value={report.overall_score || 0}
              className="h-3"
            />

            <div className="flex justify-between text-sm font-medium">
              <span>
                Aptitude: {report.aptitude_score || 0}%
              </span>

              <span>
                Coding: {report.coding_score || 0}%
              </span>
            </div>
          </Card>

          {/* SUMMARY */}
          <Card className="p-6 col-span-2 space-y-4">
            <h2 className="text-xl font-bold">
              AI Performance Summary
            </h2>

            <p className="text-slate-600 leading-relaxed">
              {report.performance_summary}
            </p>

            <div className="mt-4">
              <h3 className="font-semibold text-red-500">
                Critical Skill Gaps
              </h3>

              <ul className="list-disc pl-5 mt-2 space-y-1">
                {Array.isArray(report?.skill_gaps) &&
                  report.skill_gaps.map(
                    (gap: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-slate-700"
                      >
                        {gap}
                      </li>
                    )
                  )}
              </ul>
            </div>
          </Card>

          {/* ROADMAP */}
          <Card className="p-6 col-span-3 space-y-4">
            <h2 className="text-xl font-bold">
              Personalized Roadmap
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.isArray(report?.roadmap) &&
                report.roadmap.map(
                  (phase: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 bg-indigo-50 rounded-lg border border-indigo-100"
                    >
                      <h4 className="font-bold text-indigo-900 mb-2">
                        {phase.phase}
                      </h4>

                      <ul className="text-xs space-y-2 text-indigo-700">
                        {Array.isArray(phase.tasks) &&
                          phase.tasks.map(
                            (task: string, j: number) => (
                              <li key={j}>
                                • {task}
                              </li>
                            )
                          )}
                      </ul>
                    </div>
                  )
                )}
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};

export default CandidateAnalyzer;