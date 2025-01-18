// components/UsageStatus.tsx
import React from 'react';
import { AlertCircle, Crown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageStatusProps {
  usageCount: number;
  maxCount: number;
  isSubscribed: boolean;
  subscriptionEnds?: Date | null;
}

const UsageStatus = ({ usageCount, maxCount, isSubscribed, subscriptionEnds }: UsageStatusProps) => {
  const remainingSearches = maxCount - usageCount;
  const usagePercentage = (usageCount / maxCount) * 100;
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium'
    }).format(new Date(date));
  };

  return (
    <Alert 
      className={cn(
        "mb-6",
        !isSubscribed && "border-yellow-500 dark:border-yellow-400"
      )}
    >
      <div className="flex items-start">
        {isSubscribed ? (
          <Crown className="h-4 w-4 mt-1 text-blue-500" />
        ) : (
          <AlertCircle className="h-4 w-4 mt-1 text-yellow-500 dark:text-yellow-400" />
        )}
        <div className="ml-3 w-full">
          <AlertTitle className={cn(
            "text-lg font-semibold",
            !isSubscribed && "text-yellow-800 dark:text-yellow-200"
          )}>
            {isSubscribed ? 'Premium Account Status' : 'Trial Account Status'}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-4">
              {isSubscribed ? (
                <div>
                  <p>Monthly searches used: {usageCount} of {maxCount}</p>
                  {subscriptionEnds && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Subscription renews on {formatDate(subscriptionEnds)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-yellow-800 dark:text-yellow-200">
                  {remainingSearches > 0 ? (
                    `You have ${remainingSearches} free searches remaining.`
                  ) : (
                    'You have reached your trial limit. Please subscribe to continue using VC Vantage.'
                  )}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{usageCount} used</span>
                  <span>{maxCount} total</span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className={cn(
                    "h-2",
                    isSubscribed 
                      ? "bg-blue-100 dark:bg-blue-900" 
                      : "bg-yellow-100 dark:bg-yellow-900"
                  )}
                />
              </div>

              {!isSubscribed && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => window.location.href = '/pricing'}
                    variant={remainingSearches <= 2 ? "default" : "outline"}
                    className="px-6"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default UsageStatus;