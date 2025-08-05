import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type GroupWithStats, type Member } from "@shared/schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGroupId?: string;
}

const categories = [
  { value: "food", label: "🍕 Food & Dining", icon: "🍕" },
  { value: "transport", label: "🚗 Transportation", icon: "🚗" },
  { value: "shopping", label: "🛒 Shopping", icon: "🛒" },
  { value: "entertainment", label: "🎬 Entertainment", icon: "🎬" },
  { value: "utilities", label: "💡 Utilities", icon: "💡" },
  { value: "other", label: "📝 Other", icon: "📝" },
];

export default function AddExpenseModal({ open, onOpenChange, defaultGroupId }: Props) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "food",
    groupId: defaultGroupId || "",
    paidBy: "",
    splitType: "equal",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery<GroupWithStats[]>({
    queryKey: ["/api/groups"],
    enabled: !defaultGroupId,
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/groups", formData.groupId, "members"],
    enabled: !!formData.groupId,
  });

  useEffect(() => {
    if (defaultGroupId) {
      setFormData(prev => ({ ...prev, groupId: defaultGroupId }));
    }
  }, [defaultGroupId]);

  const createExpenseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Calculate splits based on split type
      let splitData = null;
      if (data.splitType === "equal" && members.length > 0) {
        const splitAmount = parseFloat(data.amount) / members.length;
        splitData = members.map(member => ({
          memberId: member.id,
          memberName: member.name,
          amount: splitAmount
        }));
      }

      return await apiRequest("POST", `/api/groups/${data.groupId}/expenses`, {
        description: data.description,
        amount: data.amount,
        category: data.category,
        paidBy: data.paidBy,
        splitType: data.splitType,
        splitData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", formData.groupId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", formData.groupId, "balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category: "food",
      groupId: defaultGroupId || "",
      paidBy: "",
      splitType: "equal",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Valid amount is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.groupId) {
      toast({
        title: "Error",
        description: "Please select a group",
        variant: "destructive",
      });
      return;
    }

    if (!formData.paidBy) {
      toast({
        title: "Error",
        description: "Please select who paid",
        variant: "destructive",
      });
      return;
    }

    createExpenseMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border border-white/10 text-white max-w-md animate-slide-in" aria-describedby="add-expense-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">Add New Expense</DialogTitle>
          <p id="add-expense-description" className="text-gray-400 text-sm">Record a new expense and choose how to split it among members.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-gray-300 mb-2 block">Description</Label>
            <Input
              placeholder="What was this expense for?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="glass-morphism border border-white/10 text-white placeholder-gray-400 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-8 glass-morphism border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 font-mono"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="glass-morphism border border-white/10 text-white focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-morphism border border-white/10 text-white">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!defaultGroupId && (
            <div>
              <Label className="text-gray-300 mb-2 block">Group</Label>
              <Select value={formData.groupId} onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value, paidBy: "" }))}>
                <SelectTrigger className="glass-morphism border border-white/10 text-white focus:border-purple-500">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent className="glass-morphism border border-white/10 text-white">
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.icon} {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-gray-300 mb-2 block">Paid by</Label>
            <Select value={formData.paidBy} onValueChange={(value) => setFormData(prev => ({ ...prev, paidBy: value }))}>
              <SelectTrigger className="glass-morphism border border-white/10 text-white focus:border-purple-500">
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent className="glass-morphism border border-white/10 text-white">
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Split Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.splitType === "equal" ? "default" : "outline"}
                className={formData.splitType === "equal" ? "bg-purple-500 text-white" : "glass-morphism border border-white/10 text-gray-300 hover:glass-morphism-purple"}
                onClick={() => setFormData(prev => ({ ...prev, splitType: "equal" }))}
              >
                Equal
              </Button>
              <Button
                type="button"
                variant={formData.splitType === "custom" ? "default" : "outline"}
                className={formData.splitType === "custom" ? "bg-purple-500 text-white" : "glass-morphism border border-white/10 text-gray-300 hover:glass-morphism-purple"}
                onClick={() => setFormData(prev => ({ ...prev, splitType: "custom" }))}
              >
                Custom
              </Button>
              <Button
                type="button"
                variant={formData.splitType === "percentage" ? "default" : "outline"}
                className={formData.splitType === "percentage" ? "bg-purple-500 text-white" : "glass-morphism border border-white/10 text-gray-300 hover:glass-morphism-purple"}
                onClick={() => setFormData(prev => ({ ...prev, splitType: "percentage" }))}
              >
                Percentage
              </Button>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 glass-morphism border border-white/10 text-gray-300 hover:glass-morphism-purple"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createExpenseMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
            >
              {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
