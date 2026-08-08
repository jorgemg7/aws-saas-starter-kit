import { Card } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
};

export function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-sm text-muted-foreground">
        {title}
      </h2>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </Card>
  );
}
