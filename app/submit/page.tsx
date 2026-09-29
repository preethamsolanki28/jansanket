import { Badge } from "@/components/ui/badge";
import { RequestForm } from "@/components/request-form";

export const metadata = {
  title: "Submit Citizen Request | JanSanket",
  description: "Multilingual citizen intake for infrastructure development requests and planning intelligence.",
};

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-border">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Submit Citizen Request
          </h1>
          <Badge
            variant="outline"
            className="bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD] text-xs font-medium"
          >
            Citizen Intake
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Describe an infrastructure need or public utility gap in your district. Requests are analyzed and normalized by AI to inform district planning priorities.
        </p>
      </div>

      {/* Interactive Form Component */}
      <RequestForm />
    </div>
  );
}
