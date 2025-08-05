import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { type GroupWithStats, type MemberBalance } from "@shared/schema";

export default function SettlementSummary() {
  const { data: groups = [] } = useQuery<GroupWithStats[]>({
    queryKey: ["/api/groups"],
  });

  // Calculate settlements needed across all groups
  const calculateSettlements = () => {
    const settlements: Array<{
      groupName: string;
      fromName: string;
      toName: string;
      amount: number;
      type: 'owe' | 'owed' | 'settled';
    }> = [];

    // This is a simplified version - in a real app, you'd need more complex logic
    // to optimize settlements (minimize number of transactions)
    
    // For demo purposes, showing some sample settlements
    if (groups.length > 0) {
      settlements.push(
        {
          groupName: groups[0]?.name || "Group",
          fromName: "You",
          toName: "Raushan",
          amount: 400,
          type: 'owe'
        },
        {
          groupName: groups[1]?.name || "Group",
          fromName: "Maya",
          toName: "You",
          amount: 200,
          type: 'owed'
        }
      );
    }

    return settlements;
  };

  const settlements = calculateSettlements();
  const activeSettlements = settlements.filter(s => s.type !== 'settled');

  return (
    <Card className="glass-morphism border border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Settlement Summary</h3>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${activeSettlements.length > 0 ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-xs text-gray-400">
              {activeSettlements.length} pending
            </span>
          </div>
        </div>
        
        {activeSettlements.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">All settled up!</p>
            <p className="text-gray-400 text-sm">No pending settlements</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settlements.slice(0, 3).map((settlement, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  settlement.type === 'owe' 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : settlement.type === 'owed'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'glass-morphism/30 border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-semibold">
                    {settlement.fromName === 'You' ? 'Y' : settlement.fromName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {settlement.fromName === 'You' ? 'You pay' : `${settlement.fromName} pays`} {settlement.toName === 'You' ? 'you' : settlement.toName}
                    </p>
                    <p className="text-gray-400 text-xs">{settlement.groupName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-semibold ${
                    settlement.type === 'owe' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    ₹{settlement.amount}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-purple-400 hover:text-purple-300 p-0 h-auto"
                  >
                    {settlement.type === 'owe' ? 'Settle' : 'Remind'}
                  </Button>
                </div>
              </div>
            ))}

            {settlements.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-gray-400 text-sm">
                  +{settlements.length - 3} more settlements
                </p>
              </div>
            )}

            <Button 
              onClick={() => window.location.href = '/settlements'}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
            >
              View All Settlements
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
