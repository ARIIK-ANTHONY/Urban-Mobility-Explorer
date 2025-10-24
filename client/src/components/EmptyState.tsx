import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type?: 'no-data' | 'no-results' | 'error';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ type = 'no-data', title, description, action }: EmptyStateProps) {
  const Icon = type === 'error' ? AlertCircle : type === 'no-results' ? BarChart3 : Database;
  
  return (
    <Card className="border-dashed" data-testid="empty-state">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick} data-testid="button-empty-action">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
