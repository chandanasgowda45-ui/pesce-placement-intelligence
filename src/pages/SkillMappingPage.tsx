import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useCompanies } from "@/hooks/useCompanies";
import { useEnrichedCompanySkills } from "@/hooks/useEnrichedCompanySkills";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Brain, CheckCircle2, AlertCircle, XCircle, User } from "lucide-react";

export default function SkillMappingPage() {
  const { data: companies = [] } = useCompanies();
  const { data: enrichedCompanies = [] } = useEnrichedCompanySkills(companies);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() && !userSkills.includes(skillInput.trim())) {
      setUserSkills([...userSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setUserSkills(userSkills.filter(s => s !== skill));
  };

  const analysis = useMemo(() => {
    if (userSkills.length === 0) return [];

    // Use enriched companies if available, otherwise fallback to basic companies
    const sourcedCompanies = enrichedCompanies.length > 0 ? enrichedCompanies : companies;

    return sourcedCompanies.map(company => {
      // Collect all skills from multiple sources
      const allCompanySkills = new Set<string>();

      // Add tech stack skills
      const techStack = String(company.tech_stack || (company.full_json as any)?.tech_stack || "").toLowerCase();
      techStack.split(",").forEach((s) => {
        const trimmed = s.trim().toLowerCase();
        if (trimmed) allCompanySkills.add(trimmed);
      });

      // Add enriched skills if available
      if ("enrichedSkills" in company && Array.isArray(company.enrichedSkills)) {
        company.enrichedSkills.forEach((role: any) => {
          if (Array.isArray(role.skills)) {
            role.skills.forEach((skill: string) => {
              if (skill) allCompanySkills.add(String(skill).toLowerCase());
            });
          }
        });
      }

      // Fallback to embedded roles
      const roles = ((company.full_json as any)?.job_roles || []) as any[];
      roles.forEach((r) => {
        if (Array.isArray(r.skills)) {
          r.skills.forEach((s: string) => {
            if (s) allCompanySkills.add(String(s).toLowerCase());
          });
        }
      });

      const matches = userSkills.filter((skill) =>
        allCompanySkills.has(skill.toLowerCase())
      );

      const score = (matches.length / userSkills.length) * 100;
      let fit: "High" | "Medium" | "Low" = "Low";
      if (score > 70) fit = "High";
      else if (score > 30) fit = "Medium";

      const gaps = userSkills.filter((skill) => !matches.includes(skill));

      // Find the specific role that matches best
      let bestRole = "Generalist";
      let bestRoleMatch = 0;

      const allRoles = (("enrichedSkills" in company) ? (company as any).enrichedSkills : roles) as any[];
      allRoles.forEach((r: any) => {
        const roleSkills = (r.skills || []).map((s: any) => String(s).toLowerCase());
        const roleMatches = userSkills.filter((skill) =>
          roleSkills.includes(skill.toLowerCase())
        ).length;
        if (roleMatches > bestRoleMatch) {
          bestRoleMatch = roleMatches;
          bestRole = r.role || "Generalist";
        }
      });

      return {
        ...company,
        matchScore: Math.round(score),
        fit,
        matches,
        gaps,
        bestRole,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [companies, enrichedCompanies, userSkills]);

  return (
    <AppLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-primary uppercase italic">Institutional Skill Mapping</h1>
          <p className="text-muted-foreground text-lg">
            Objective alignment analysis between student capabilities and enterprise requirements.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Skill Input Panel */}
          <Card className="lg:col-span-1 border-2 border-primary/20 shadow-xl bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Skill Profile
              </CardTitle>
              <CardDescription>Enter your core technical skills to begin matching.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. React, Python, AWS"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="border-2 focus-visible:ring-primary"
                />
                <Button onClick={handleAddSkill} className="font-bold">ADD</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {userSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-2">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {userSkills.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Alignment Intelligence
              </h2>
              {userSkills.length > 0 && (
                <Badge variant="outline" className="text-xs font-black">
                  ANALYZING {companies.length} ENTITIES
                </Badge>
              )}
            </div>

            {userSkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-4 border-dashed rounded-3xl bg-muted/20">
                <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-1">Awaiting Profile Input</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Enter your skills in the left panel to trigger the objective matching engine.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {analysis.slice(0, 10).map(item => (
                  <Card key={item.company_id} className="border-2 hover:border-primary transition-all overflow-hidden group">
                    <div className={`h-1.5 w-full ${item.fit === "High" ? "bg-green-500" : item.fit === "Medium" ? "bg-yellow-500" : "bg-red-500"
                      }`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <CardTitle className="text-sm font-black truncate">{item.name}</CardTitle>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">Target: {item.bestRole}</span>
                        </div>
                        <Badge className={`${item.fit === "High" ? "bg-green-500/10 text-green-600 border-green-200" :
                            item.fit === "Medium" ? "bg-yellow-500/10 text-yellow-600 border-yellow-200" :
                              "bg-red-500/10 text-red-600 border-red-200"
                          } text-[10px] font-black uppercase`}>
                          {item.fit} FIT
                        </Badge>
                      </div>
                      <CardDescription className="text-xs truncate">{item.tech_stack || "No tech stack specified"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-black">{item.matchScore}%</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold leading-none">Alignment<br />Score</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase">
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> Matches
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.matches.map(m => <Badge key={m} variant="secondary" className="text-[9px] px-1 py-0">{m}</Badge>)}
                          {item.matches.length === 0 && <span className="text-[9px] italic text-muted-foreground">None</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase">
                          <AlertCircle className="h-3 w-3 text-orange-500" /> Gaps
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.gaps.map(g => <Badge key={g} variant="outline" className="text-[9px] px-1 py-0 border-orange-200 text-orange-600">{g}</Badge>)}
                          {item.gaps.length === 0 && <span className="text-[9px] italic text-muted-foreground text-green-600">Full Coverage</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
