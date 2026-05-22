import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Calendar, TrendingUp, Info, Brain, GitBranch, Sparkles, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SafeImage from '@/components/common/SafeImage';
import { Company } from '@/types/company'; // Assuming Company type is available

interface CompanyHeaderProps {
  company: Company;
  activeView: string;
}

export function CompanyHeader({ company, activeView }: CompanyHeaderProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const intelScore = typeof company.intelligence === "object" ? company.intelligence?.scores?.overall : undefined;

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur border-b p-4 mb-6 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
            {company.logo_url ? (
              <SafeImage 
                src={company.logo_url}
                alt={company.name}
                className="h-8 w-8 rounded object-contain"
              />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{company.name}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.headquarters_address || 'N/A'}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Est. {company.incorporation_year || 'N/A'}</span>
              {intelScore !== undefined && (
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-primary" />Score: {intelScore}%</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeView === 'details' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => navigate(`/companies/${company.company_id}`)}
          >
            <Info className="h-4 w-4 mr-2" /> Overview
          </Button>
          <Button 
            variant={activeView === 'skills' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => navigate(`/companies/${company.company_id}/skills`)}
          >
            <Brain className="h-4 w-4 mr-2" /> Skills
          </Button>
          <Button 
            variant={activeView === 'hiring-rounds' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => navigate(`/companies/${company.company_id}/process`)}
          >
            <GitBranch className="h-4 w-4 mr-2" /> Hiring Rounds
          </Button>
          <Button 
            variant={activeView === 'intelligence' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => navigate(`/companies/${company.company_id}/intelligence`)}
          >
            <TrendingUp className="h-4 w-4 mr-2" /> Intelligence
          </Button>
          <Button 
            variant={activeView === 'innovx' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => navigate(`/companies/${company.company_id}/innovx`)}
          >
            <Sparkles className="h-4 w-4 mr-2" /> InnovX
          </Button>
        </div>
      </div>
    </div>
  );
}