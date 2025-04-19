import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, DollarSign } from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
  totalVotes: number;
  totalAmount: number;
}

interface ApplicationStatsProps {
  stats?: Partial<Stats>;
}

export function ApplicationStats({ stats = {} }: ApplicationStatsProps) {
  // Default values for stats
  const safeStats = {
    total: stats.total ?? 0,
    pending: stats.pending ?? 0,
    approved: stats.approved ?? 0,
    rejected: stats.rejected ?? 0,
    paid: stats.paid ?? 0,
    totalVotes: stats.totalVotes ?? 0,
    totalAmount: stats.totalAmount ?? 0,
  };

  const items = [
    {
      title: "Total Applications",
      value: safeStats.total,
      icon: Users,
      description: `${safeStats.pending} pending`,
      color: "text-blue-600",
    },
    {
      title: "Approved",
      value: safeStats.approved,
      icon: CheckCircle,
      description: `${safeStats.total ? ((safeStats.approved / safeStats.total) * 100).toFixed(1) : 0}% rate`,
      color: "text-green-600",
    },
    {
      title: "Total Votes",
      value: safeStats.totalVotes,
      icon: Users,
      description: `${safeStats.total ? (safeStats.totalVotes / safeStats.total).toFixed(1) : 0} avg per application`,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: `$${safeStats.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      description: `${safeStats.paid} paid applications`,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}