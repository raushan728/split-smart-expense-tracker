import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Plus, Settings, Users, Receipt, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import AddExpenseModal from "@/components/add-expense-modal";
import AddMemberModal from "@/components/add-member-modal";
import GroupSettingsModal from "@/components/group-settings-modal";
import { useState } from "react";
import { type ExpenseWithDetails, type Member, type MemberBalance } from "@shared/schema";

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);

  const { data: group } = useQuery<{ id: string; name: string; icon: string; createdBy: string; createdAt: Date }>({
    queryKey: ["/api/groups", id],
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/groups", id, "members"],
  });

  const { data: expenses = [] } = useQuery<ExpenseWithDetails[]>({
    queryKey: ["/api/groups", id, "expenses"],
  });

  const { data: balances = [] } = useQuery<MemberBalance[]>({
    queryKey: ["/api/groups", id, "balances"],
  });

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: "🍕",
      transport: "🚗",
      shopping: "🛒",
      entertainment: "🎬",
      utilities: "💡",
      other: "📝"
    };
    return icons[category] || "📝";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "from-orange-500 to-red-500",
      transport: "from-blue-500 to-indigo-500",
      shopping: "from-green-500 to-teal-500",
      entertainment: "from-purple-500 to-pink-500",
      utilities: "from-yellow-500 to-orange-500",
      other: "from-gray-500 to-gray-600"
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  if (!group) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Group not found</h2>
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="glass-morphism">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">
                {group?.icon || "🏠"}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{group?.name || "Loading..."}</h1>
                <p className="text-gray-400 text-sm sm:text-base">{members.length} members • {expenses.length} expenses</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowAddExpense(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            <Button
              onClick={() => setShowAddMember(true)}
              variant="outline"
              className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
            <Button
              onClick={() => setShowGroupSettings(true)}
              variant="outline"
              className="glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Expenses */}
            <Card className="glass-morphism border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Recent Expenses</h3>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                    {expenses.length} total
                  </Badge>
                </div>

                {expenses.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No expenses yet</h3>
                    <p className="text-gray-500 mb-4">Add your first expense to get started</p>
                    <Button onClick={() => setShowAddExpense(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <Card key={expense.id} className="glass-morphism/50 border border-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(expense.category)} rounded-xl flex items-center justify-center text-lg`}>
                                {getCategoryIcon(expense.category)}
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">{expense.description}</h4>
                                <p className="text-gray-400 text-sm">
                                  Paid by {expense.paidByName} • {new Date(expense.date).toLocaleDateString()}
                                </p>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {expense.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-400 font-mono">
                                ₹{expense.amount}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Split between {expense.splits.length} people
                              </p>
                            </div>
                          </div>

                          {/* Splits */}
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-2">
                              {expense.splits.map((split) => (
                                <div key={split.memberId} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-300">{split.memberName}</span>
                                  <span className="text-cyan-400 font-mono">₹{split.amount.toFixed(2)}</span>
                                </div>
                              ))}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card className="glass-morphism border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Members</h3>
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{member.name}</p>
                        {member.email && (
                          <p className="text-gray-400 text-xs">{member.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Balances */}
            <Card className="glass-morphism border border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Balances</h3>
                
                <div className="space-y-4">
                  {balances.map((balance) => (
                    <div key={balance.memberId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{balance.memberName}</span>
                        <span className={`font-mono ${balance.balance > 0 ? 'text-green-400' : balance.balance < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          ₹{Math.abs(balance.balance).toFixed(2)}
                        </span>
                      </div>
                      
                      {balance.balance > 0 && (
                        <p className="text-xs text-green-400">Is owed money</p>
                      )}
                      {balance.balance < 0 && (
                        <p className="text-xs text-red-400">Owes money</p>
                      )}
                      {balance.balance === 0 && (
                        <p className="text-xs text-gray-400">All settled up</p>
                      )}
                    </div>
                  ))}
                  
                  {balances.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No balances to show yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddExpenseModal 
        open={showAddExpense} 
        onOpenChange={setShowAddExpense}
        defaultGroupId={id}
      />
      <AddMemberModal
        open={showAddMember}
        onOpenChange={setShowAddMember}
        groupId={id!}
      />
      <GroupSettingsModal
        open={showGroupSettings}
        onOpenChange={setShowGroupSettings}
        groupId={id!}
      />
    </div>
  );
}
