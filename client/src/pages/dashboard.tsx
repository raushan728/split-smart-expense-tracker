import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Plus, Download, Receipt, Users, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import CreateGroupModal from "@/components/create-group-modal";
import AddExpenseModal from "@/components/add-expense-modal";
import SettlementSummary from "@/components/settlement-summary";
import ExpenseAnalytics from "@/components/expense-analytics";
import { type GroupWithStats } from "@shared/schema";
import { exportToPDF, exportToCSV } from "@/lib/export";

export default function Dashboard() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const { data: groups = [], isLoading: groupsLoading } = useQuery<GroupWithStats[]>({
    queryKey: ["/api/groups"],
  });

  const { data: userStats, isLoading: statsLoading } = useQuery<{
    totalGroups: number;
    totalExpenses: string;
    youOwe: string;
    youreOwed: string;
  }>({
    queryKey: ["/api/user/stats"],
  });

  const handleExport = () => {
    if (groups.length > 0) {
      exportToPDF(groups);
      exportToCSV(groups);
    }
  };

  if (groupsLoading || statsLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 glass-morphism rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 glass-morphism rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8 text-center animate-fade-in px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text neon-shadow">
              Your Expense Groups
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Track, split, and settle your group expenses with smart calculations and beautiful analytics.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Groups</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    {userStats?.totalGroups || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="text-purple-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-green-400 font-mono">
                    ₹{userStats?.totalExpenses || "0.00"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="text-green-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">You Owe</p>
                  <p className="text-2xl font-bold text-red-400 font-mono">
                    ₹{userStats?.youOwe || "0.00"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-red-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">You're Owed</p>
                  <p className="text-2xl font-bold text-cyan-400 font-mono">
                    ₹{userStats?.youreOwed || "0.00"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="text-cyan-400 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center sm:justify-start">
          <Button
            onClick={() => setShowCreateGroup(true)}
            className="px-4 py-3 sm:px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create New Group</span>
            <span className="sm:hidden">Create Group</span>
          </Button>
          <Button
            onClick={() => setShowAddExpense(true)}
            className="px-4 py-3 sm:px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 text-sm sm:text-base"
          >
            <Receipt className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Quick Add Expense</span>
            <span className="sm:hidden">Add Expense</span>
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="px-4 py-3 sm:px-6 glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export Reports</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups List */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Active Groups</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{groups.length} groups</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {groups.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No groups yet</h3>
                    <p className="text-gray-500 mb-4">Create your first group to start tracking expenses</p>
                    <Button onClick={() => setShowCreateGroup(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Group
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <Link key={group.id} href={`/group/${group.id}`}>
                        <Card className="glass-morphism/50 border border-white/5 hover:glass-morphism-purple hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl">
                                  {group.icon}
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-white typewriter-text">
                                    {group.name}
                                  </h4>
                                  <p className="text-gray-400 text-sm">
                                    {group.memberCount} members
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-xs text-green-400">
                                      Total: ₹{group.totalExpenses}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="flex -space-x-2">
                                    {[...Array(Math.min(group.memberCount, 3))].map((_, i) => (
                                      <div
                                        key={i}
                                        className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-[var(--dark-navy)] flex items-center justify-center text-xs font-semibold"
                                      >
                                        {String.fromCharCode(65 + i)}
                                      </div>
                                    ))}
                                    {group.memberCount > 3 && (
                                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-[var(--dark-navy)] flex items-center justify-center text-xs font-semibold">
                                        +{group.memberCount - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {group.recentExpense && (
                              <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                      <Receipt className="text-yellow-400 text-xs" />
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">
                                        {group.recentExpense.description}
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        {new Date(group.recentExpense.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-green-400 font-mono">
                                      ₹{group.recentExpense.amount}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      Paid by {group.recentExpense.paidByName}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <SettlementSummary />
            <ExpenseAnalytics />
          </div>
        </div>
      </div>

      <CreateGroupModal open={showCreateGroup} onOpenChange={setShowCreateGroup} />
      <AddExpenseModal open={showAddExpense} onOpenChange={setShowAddExpense} />
    </div>
  );
}
