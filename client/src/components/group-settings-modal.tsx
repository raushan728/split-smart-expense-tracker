import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Trash2, Save } from "lucide-react";
import { type Group } from "@shared/schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

const groupIcons = ["🏖️", "🏠", "💼", "🎉", "✈️", "🍕", "🎬", "🛒", "🏃", "📚"];

export default function GroupSettingsModal({ open, onOpenChange, groupId }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "🏠",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: group } = useQuery<Group>({
    queryKey: ["/api/groups", groupId],
    enabled: open && !!groupId,
  });

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        icon: group.icon,
      });
    }
  }, [group]);

  const updateGroupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PUT", `/api/groups/${groupId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success",
        description: "Group updated successfully!",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/groups/${groupId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success",
        description: "Group deleted successfully!",
      });
      onOpenChange(false);
      // Navigate back to dashboard
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    },
  });

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

    updateGroupMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      deleteGroupMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border border-white/10 text-white max-w-md animate-slide-in" aria-describedby="group-settings-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            Group Settings
          </DialogTitle>
          <p id="group-settings-description" className="text-gray-400 text-sm">Manage group details and preferences.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-gray-300 mb-2 block">Group Name</Label>
            <Input
              placeholder="Enter group name"
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

          <div className="flex flex-col space-y-4 pt-4">
            <div className="flex space-x-4">
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
                disabled={updateGroupMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateGroupMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleteGroupMutation.isPending}
              variant="destructive"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteGroupMutation.isPending ? "Deleting..." : "Delete Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}