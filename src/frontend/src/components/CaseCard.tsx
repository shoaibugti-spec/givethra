import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MapPin, User } from "lucide-react";
import { CategoryPill } from "./CategoryPill";
import { VerificationBadge, type VerificationLevel } from "./VerificationBadge";

export interface CaseCardData {
  id: string;
  title: string;
  category: string;
  country: string;
  city: string;
  amountNeeded: number;
  amountRaised: number;
  verificationLevel: VerificationLevel;
  imageUrl?: string;
  description?: string;
  applicantName?: string;
}

interface Props {
  data: CaseCardData;
  onClick?: () => void;
  className?: string;
  showViewDetails?: boolean;
}

export function CaseCard({
  data,
  onClick,
  className,
  showViewDetails = true,
}: Props) {
  const progress =
    data.amountNeeded > 0
      ? Math.min(Math.round((data.amountRaised / data.amountNeeded) * 100), 100)
      : 0;

  return (
    <Card
      data-ocid="case.card"
      className={cn(
        "overflow-hidden border border-border transition-smooth cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 flex flex-col",
        className,
      )}
    >
      {/* Profile / Image area */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary/60" />
            </div>
          </div>
        )}
        {/* Verification badge overlay */}
        <div className="absolute top-2 left-2">
          <VerificationBadge level={data.verificationLevel} size="sm" />
        </div>
        {/* Category overlay */}
        <div className="absolute top-2 right-2">
          <CategoryPill category={data.category} size="xs" />
        </div>
      </div>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-1 space-y-1.5">
          {data.applicantName && (
            <p className="text-xs text-muted-foreground font-medium">
              {data.applicantName}
            </p>
          )}
          <h3 className="font-display font-semibold text-foreground leading-snug line-clamp-2 text-sm">
            {data.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate min-w-0">
            {data.city}, {data.country}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Amount needed</span>
            <span className="font-bold text-foreground text-sm">
              ${data.amountNeeded.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress}% raised</span>
            <span>${data.amountRaised.toLocaleString()} raised</span>
          </div>
        </div>

        {showViewDetails && (
          <Button
            size="sm"
            className="w-full mt-1 h-8 text-xs font-semibold"
            onClick={onClick}
            data-ocid="case.view_details_button"
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
