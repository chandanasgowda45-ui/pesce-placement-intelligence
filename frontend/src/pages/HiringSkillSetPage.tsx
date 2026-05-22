import AppLayout from "@/components/layout/AppLayout";
import { useCompanies } from "@/hooks/useCompanies";
import { useEnrichedCompanySkills } from "@/hooks/useEnrichedCompanySkills";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import SafeImage from "@/components/common/SafeImage";
import { Link } from "react-router-dom";

const skillSets = [
  "Coding",
  "Data Structures and Algorithms",
  "Aptitude and Problem Solving",
  "Communication Skills",
  "Object-Oriented Programming and Design",
  "AI Native Engineering",
  "SQL and Design",
  "System Design and Architecture",
  "DevOps and Cloud",
  "Software Engineering",
  "Computer Networking",
  "Operating System"
];

const bloomLevels = {
  CO: "Comprehension",
  AP: "Application",
  AN: "Analysis",
  EV: "Evaluation",
  CR: "Creation"
};

export default function HiringSkillSetPage() {
  const { data: companies = [] } = useCompanies();
  const { data: enrichedCompanies = [] } = useEnrichedCompanySkills(companies);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(skillSets);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Deterministic ratings based on company data
  const skillData = useMemo(() => {
    const getTextValues = (company: any) => {
      const fullJson = company.full_json as Record<string, unknown> | undefined;
      const techStack = String(company.tech_stack || fullJson?.tech_stack || "").toLowerCase();
      
      // Use enriched skills if available
      let roleSkills: string[] = [];
      if ("enrichedSkills" in company && Array.isArray(company.enrichedSkills)) {
        roleSkills = company.enrichedSkills
          .flatMap((role: any) => Array.isArray(role.skills) ? role.skills as string[] : [])
          .map(skill => String(skill).toLowerCase());
      } else if (Array.isArray(fullJson?.job_roles)) {
        roleSkills = (fullJson?.job_roles as Array<Record<string, unknown>>)
          .flatMap(role => Array.isArray(role.skills) ? role.skills as string[] : [])
          .map(skill => String(skill).toLowerCase());
      }
      
      const explicitSkills = Array.isArray(fullJson?.skills)
        ? (fullJson?.skills as string[]).map(skill => String(skill).toLowerCase())
        : [];

      return {
        techStackWords: techStack.split(",").map(s => s.trim()).filter(Boolean),
        roleSkills,
        explicitSkills,
        otherText: [company.name, company.category, company.company_tier, company.overview_text]
          .filter(Boolean)
          .map(value => String(value).toLowerCase())
          .join(" ")
      };
    };

    const keywordMap: Record<string, string[]> = {
      "Coding": ["coding", "programming", "software", "development", "developer", "sde", "engineer"],
      "Data Structures and Algorithms": ["data structures", "algorithms", "dsa", "algorithm", "problem solving"],
      "Aptitude and Problem Solving": ["aptitude", "problem solving", "analytics", "quantitative", "math"],
      "Communication Skills": ["communication", "presentations", "verbal", "written", "soft skill", "collaboration"],
      "Object-Oriented Programming and Design": ["oop", "object oriented", "design patterns", "system design", "architecture"],
      "AI Native Engineering": ["ai", "artificial intelligence", "machine learning", "ml", "deep learning", "data science"],
      "SQL and Design": ["sql", "database", "postgres", "mysql", "schema", "query"],
      "System Design and Architecture": ["system design", "architecture", "microservices", "scalability", "distributed"],
      "DevOps and Cloud": ["devops", "cloud", "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd"],
      "Software Engineering": ["software engineering", "engineering", "quality", "testing", "agile"],
      "Computer Networking": ["network", "tcp", "udp", "routing", "switches", "firewall", "networking"],
      "Operating System": ["operating system", "linux", "kernel", "os", "windows", "unix"]
    };

    const scoreSkillSet = (skill: string, values: ReturnType<typeof getTextValues>) => {
      const allText = [...values.techStackWords, ...values.roleSkills, ...values.explicitSkills, values.otherText];
      const normalized = allText.join(" ");
      const keywords = keywordMap[skill] || [];
      const matches = keywords.filter(keyword => normalized.includes(keyword));

      if (matches.length >= 2) return 9;
      if (matches.length === 1) return 7;
      if (values.techStackWords.length + values.roleSkills.length + values.explicitSkills.length > 0) return 5;
      return 4;
    };

    const getBloomCode = (score: number) => {
      if (score >= 9) return "CR";
      if (score >= 7) return "EV";
      if (score >= 5) return "AP";
      return "AN";
    };

    // Use enriched companies if available, otherwise fallback to basic companies
    const sourcedCompanies = enrichedCompanies.length > 0 ? enrichedCompanies : companies;

    return sourcedCompanies.map(company => {
      const values = getTextValues(company);
      const hasRealData = values.techStackWords.length > 0 || values.roleSkills.length > 0 || values.explicitSkills.length > 0;
      const skillsObj = skillSets.reduce((acc, skill) => {
        const score = hasRealData ? scoreSkillSet(skill, values) : 5;
        const bloomCode = getBloomCode(score);
        acc[skill] = `${score}-${bloomCode}`;
        return acc;
      }, {} as Record<string, string>);
      return {
        ...company,
        skills: skillsObj
      };
    });
  }, [companies, enrichedCompanies]);

  const totalPages = Math.ceil(skillData.length / rowsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return skillData.slice(start, start + rowsPerPage);
  }, [skillData, currentPage, rowsPerPage]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const selectAllSkills = () => setSelectedSkills(skillSets);
  const clearAllSkills = () => setSelectedSkills([]);

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 font-bold";
    if (rating >= 6) return "text-yellow-600 font-semibold";
    return "text-gray-600";
  };

  const getBloomColor = (code: string) => {
    switch (code) {
      case "CR": return "bg-purple-100 text-purple-800";
      case "EV": return "bg-blue-100 text-blue-800";
      case "AN": return "bg-green-100 text-green-800";
      case "AP": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hiring Skill Sets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare skill expectations and cognitive depth across recruiters
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllSkills}
              disabled={selectedSkills.length === skillSets.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllSkills}
              disabled={selectedSkills.length === 0}
            >
              Clear All
            </Button>
          </div>

          <Select value={rowsPerPage.toString()} onValueChange={(v) => setRowsPerPage(Number(v))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 companies per page</SelectItem>
              <SelectItem value="50">50 companies per page</SelectItem>
              <SelectItem value="100">100 companies per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skill Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Skill Sets to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillSets.map(skill => (
                <Button
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSkill(skill)}
                  className="text-xs"
                >
                  {skill}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold sticky left-0 bg-background z-10 min-w-[200px]">
                      Company
                    </th>
                    {selectedSkills.map(skill => (
                      <th key={skill} className="text-center p-4 font-semibold min-w-[120px]">
                        {skill}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompanies.map(company => (
                    <tr key={company.company_id} className="border-b hover:bg-muted/50">
                      <td className="p-4 sticky left-0 bg-background">
                        <Link
                          to={`/companies/${company.company_id}`}
                          className="flex items-center gap-3 hover:text-primary"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                            {company.logo_url ? (
                              <SafeImage
                                src={company.logo_url}
                                alt={company.name}
                                className="h-6 w-6 rounded object-contain"
                              />
                            ) : (
                              <span className="text-xs font-bold">
                                {(company.name || "C").charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{company.name}</p>
                            {company.category && (
                              <Badge variant="secondary" className="text-xs">
                                {company.category}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </td>
                      {selectedSkills.map(skill => {
                        const [rating, bloomCode] = company.skills[skill].split("-");
                        return (
                          <td key={skill} className="text-center p-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-lg ${getRatingColor(Number(rating))}`}>
                                {rating}
                              </span>
                              <Badge className={`text-xs ${getBloomColor(bloomCode)}`}>
                                {bloomCode}
                              </Badge>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, skillData.length)} of {skillData.length} companies
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}