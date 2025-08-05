import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, DollarSign } from "lucide-react";
import { type GroupWithStats, type MemberBalance } from "@shared/schema";
import { calculateOptimalSettlements } from "@/lib/calculations";

export default function SettlementsPage() {
  const { data: groups = [] } = useQuery<GroupWithStats[]>({
    queryKey: ["/api/groups"],
  });

  // Get all settlements from all groups
  const getAllSettlements = async () => {
    const allSettlements: Array<{
      groupName: string;
      fromName: string;
      toName: string;
      amount: number;
      type: 'owe' | 'owed' | 'settled';
      groupId: string;
    }> = [];

    for (const group of groups) {
      try {
        const response = await fetch(`/api/groups/${group.id}/balances`);
        const balances: MemberBalance[] = await response.json();
        
        const settlements = calculateOptimalSettlements(
          balances.map(b => ({ id: b.memberId, name: b.memberName, balance: b.balance }))
        );

        settlements.forEach(settlement => {
          allSettlements.push({
            groupName: group.name,
            fromName: settlement.from,
            toName: settlement.to,
            amount: settlement.amount,
            type: 'owe',
            groupId: group.id
          });
        });
      } catch (error) {
        console.error(`Failed to fetch balances for group ${group.id}:`, error);
      }
    }

    return allSettlements;
  };

  const { data: allSettlements = [] } = useQuery({
    queryKey: ["/api/all-settlements"],
    queryFn: getAllSettlements,
    enabled: groups.length > 0,
  });

  const handleMarkSettled = (settlement: any) => {
    // In a real app, you'd call an API to mark this settlement as completed
    console.log("Marking settlement as completed:", settlement);
  };

  const totalAmount = allSettlements.reduce((sum, settlement) => sum + settlement.amount, 0);

  return (
    <div className="min-h-screen relative z-10 bg-gradient-to-br from-[var(--dark-navy)] via-[var(--darker-navy)] to-[var(--dark-navy)] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text neon-shadow">
              Settlement Center
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Optimize your settlements and clear all debts with minimum transactions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Settlements</p>
                  <p className="text-2xl font-bold text-yellow-400 font-mono">
                    {allSettlements.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <ArrowRight className="text-yellow-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-green-400 font-mono">
                    ₹{totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-green-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Groups Involved</p>
                  <p className="text-2xl font-bold text-purple-400 font-mono">
                    {new Set(allSettlements.map(s => s.groupId)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-purple-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settlements List */}
        <Card className="glass-morphism border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">All Settlements</h3>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                {allSettlements.length} pending
              </Badge>
            </div>

            {allSettlements.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-400 mb-2">All settled up!</h3>
                <p className="text-gray-400 mb-4">No pending settlements across all groups</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allSettlements.map((settlement, index) => (
                  <Card key={index} className="glass-morphism/50 border border-white/5 hover:glass-morphism-purple transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold">
                            {settlement.fromName.charAt(0)}
                          </div>
                          <ArrowRight className="text-gray-400 h-5 w-5" />
                          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-semibold">
                            {settlement.toName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {settlement.fromName} pays {settlement.toName}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {settlement.groupName}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right flex items-center space-x-4">
                          <div>
                            <p className="text-2xl font-bold text-green-400 font-mono">
                              ₹{settlement.amount.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleMarkSettled(settlement)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Settled
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}