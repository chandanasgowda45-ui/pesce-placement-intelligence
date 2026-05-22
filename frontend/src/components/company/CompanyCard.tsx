import { Company } from "@/types/company";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, MapPin, Calendar, Briefcase } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { Link, useNavigate } from "react-router-dom";
import { getStrategicCategory } from "@/lib/categoryUtils";

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/companies/${company.company_id}`);
    }
  };

  return (
    <Card
      className="group hover:border-primary/30 transition-all hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border overflow-hidden">
            <SafeImage
              src={company.logo_url || ""}
              alt={company.name ?? "Company"}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {company.name ?? "Not Available"}
            </h3>
            {company.short_name && (
              <p className="text-xs text-muted-foreground">{company.short_name}</p>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0 items-end">
            {company.category && (
              <Badge variant="secondary" className="text-[10px]">
                {company.category}
              </Badge>
            )}
            <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter ${getStrategicCategory(company).color}`}>
              {getStrategicCategory(company).icon} {getStrategicCategory(company).label}
            </Badge>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {company.incorporation_year && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Established: {company.incorporation_year}</span>
            </div>
          )}
          {company.nature_of_company && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              <span>{company.nature_of_company}</span>
            </div>
          )}
          {company.employee_size && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{company.employee_size}</span>
            </div>
          )}
          {company.headquarters_address && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">HQ: {company.headquarters_address}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
