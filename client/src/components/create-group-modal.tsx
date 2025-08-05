import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const groupIcons = ["🏖️", "🏠", "💼", "🎉", "✈️", "🍕", "🎬", "🛒", "🏃", "📚"];

export default function CreateGroupModal({ open, onOpenChange }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "🏠",
  });
  const [members, setMembers] = useState<string[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string; members: string[] }) => {
      const groupResponse = await apiRequest("POST", "/api/groups", {
        name: data.name,
        icon: data.icon,
      });
      const group = await groupResponse.json();

      // Add members to the group
      for (const memberEmail of data.members) {
        await apiRequest("POST", `/api/groups/${group.id}/members`, {
          name: memberEmail.split("@")[0], // Use email prefix as name
          email: memberEmail,
        });
      }

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success",
        description: "Group created successfully!",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addMember = () => {
    if (newMemberEmail.trim() && !members.includes(newMemberEmail.trim())) {
      setMembers([...members, newMemberEmail.trim()]);
      setNewMemberEmail("");
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter(m => m !== email));
  };

  const resetForm = () => {
    setFormData({ name: "", icon: "🏠" });
    setMembers([]);
    setNewMemberEmail("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate({
      ...formData,
      members,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border border-white/10 text-white max-w-md animate-slide-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">Create New Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-gray-300 mb-2 block">Group Name</Label>
            <Input
              placeholder="e.g., Weekend Trip, Roommates, Office Lunch"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="glass-morphism border border-white/10 text-white placeholder-gray-400 focus:border-purple-500"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Group Icon</Label>
            <div className="grid grid-cols-5 gap-3">
              {groupIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-300 hover:scale-105 ${
                    formData.icon === icon 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'glass-morphism hover:glass-morphism-purple'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Add Members</Label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="glass-morphism border border-white/10 text-white placeholder-gray-400 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                />
                <Button
                  type="button"
                  onClick={addMember}
                  variant="outline"
                  className="glass-morphism"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {members.map((email) => (
                    <div
                      key={email}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeMember(email)}
                        className="text-purple-400 hover:text-purple-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              disabled={createGroupMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
            >
              {createGroupMutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
