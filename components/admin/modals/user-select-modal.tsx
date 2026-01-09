// components/admin/modals/user-select-modal.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, User as UserIcon } from "lucide-react";
import { userService } from "@/services"; // Assuming userService has getAllUsers
import { UserDb } from "@/models";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";

type UserSelectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: number) => void;
  title: string;
  description: string;
  excludeUserIds?: number[]; // Optional: IDs of users to exclude from the list (e.g., already admins)
};

export function UserSelectModal({
  open,
  onOpenChange,
  onSelectUser,
  title,
  description,
  excludeUserIds = [],
}: UserSelectModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // getAllUsers returns { content: UserDb[], totalElements: number }
      const response = await userService.getAllUsers(0, 1000); // Fetch a large number of users
      console.log("UserSelectModal - Raw response from getAllUsers:", response);
      
      let usersList: UserDb[] = [];
      if (response && Array.isArray(response.content)) {
        usersList = response.content;
      } else if (Array.isArray(response)) {
        // Fallback: si la réponse est directement un tableau
        usersList = response;
      } else {
        console.error("Unexpected response structure for getAllUsers:", response);
        setUsers([]);
        toast({
          title: "Erreur de données",
          description: "Impossible de charger la liste des utilisateurs.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("UserSelectModal - Extracted users list:", usersList);
      console.log("UserSelectModal - Number of users:", usersList.length);
      console.log("UserSelectModal - Exclude user IDs:", excludeUserIds);
      
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users for selection:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, excludeUserIds]);

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSearchTerm("");
      setSelectedUserId(null);
    }
  }, [open, fetchUsers]);

  const filteredUsers = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) => {
        const isExcluded = excludeUserIds.includes(user.id!);
        const matchesSearch = !searchTerm || 
          user.fullName?.toLowerCase().includes(lowercasedSearchTerm) ||
          user.email?.toLowerCase().includes(lowercasedSearchTerm);
        
        if (isExcluded) {
          console.log(`User ${user.id} (${user.fullName || user.email}) is excluded (already admin)`);
        }
        
        return !isExcluded && matchesSearch;
      }
    );
    
    console.log("UserSelectModal - Filtered users:", {
      totalUsers: users.length,
      excludedCount: users.filter(u => excludeUserIds.includes(u.id!)).length,
      filteredCount: filtered.length,
      searchTerm: searchTerm || "(empty)"
    });
    
    return filtered;
  }, [searchTerm, users, excludeUserIds]);

  const handleSelect = () => {
    if (selectedUserId !== null) {
      onSelectUser(selectedUserId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] h-[90vh] sm:h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="flex-none px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
            <DialogDescription className="text-sm">{description}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-none px-4 sm:px-6 pb-3 sm:pb-4">
          <Input
            placeholder="Rechercher un utilisateur par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-1 min-h-0 px-4 sm:px-6 overflow-hidden">
          <ScrollArea className="h-full w-full">
            {loading ? (
              <div className="py-8">
                <PageLoader />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé.</div>
            ) : (
              <div className="space-y-2 pr-2 sm:pr-4 pb-4">
                {filteredUsers.map((user) => {
                  const displayName = user.fullName?.trim() || user.email?.split('@')[0] || `Utilisateur #${user.id}`;
                  return (
                    <Button
                      key={user.id}
                      variant="outline"
                      className={`w-full justify-start text-left h-auto py-2 px-3 ${
                        selectedUserId === user.id ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      onClick={() => setSelectedUserId(user.id!)}
                    >
                      <Avatar className="h-8 w-8 mr-2 sm:mr-3 shrink-0">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <AvatarFallback className="text-xs">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-medium truncate text-sm sm:text-base">{displayName}</div>
                        {user.email && (
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        )}
                      </div>
                      {selectedUserId === user.id && <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary ml-2 shrink-0" />}
                    </Button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter className="flex-none px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6 border-t gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-initial">
            Annuler
          </Button>
          <Button type="button" onClick={handleSelect} disabled={selectedUserId === null} className="flex-1 sm:flex-initial">
            Sélectionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
