"use client";

import { useState } from "react";
import { Button, Input, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, ModalContent, Select, type SelectOption } from "@/components/ui";
import { useWorkspaces, type InviteMemberData } from "@/data/workspaces";
import { type UseDisclosureReturn } from "@/hooks/use-disclosure";
import { UserAdd } from "iconsax-reactjs";
import { toast } from "react-hot-toast";

interface InviteMemberModalProps {
  disclosure: UseDisclosureReturn;
  workspaceId: string;
  onMemberInvited?: () => void;
}

const roleOptions: SelectOption[] = [
  { value: "admin", label: "Admin", description: "Can manage workspace and invite members" },
  { value: "member", label: "Member", description: "Can access workspace resources" },
  { value: "guest", label: "Guest", description: "Limited access to workspace" }
];

export function InviteMemberModal({ disclosure, workspaceId, onMemberInvited }: InviteMemberModalProps) {
  const { inviteMember } = useWorkspaces();
  const [inviteForm, setInviteForm] = useState<InviteMemberData>({
    email: "",
    role: "member",
    message: ""
  });
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteMember = async () => {
    if (!workspaceId || !inviteForm.email.trim()) return;
    
    try {
      setIsInviting(true);
      await inviteMember(workspaceId, inviteForm);
      
      // Show success toast
      toast.success("Invitation sent successfully!");
      
      // Reset form
      setInviteForm({ email: "", role: "member", message: "" });
      disclosure.onClose();
      onMemberInvited?.();
    } catch (err) {
      console.error("Failed to invite member:", err);
      // Show error toast with the specific error message
      toast.error(err?.error || err?.message || "Failed to invite member. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setInviteForm({ email: "", role: "member", message: "" });
    disclosure.onClose();
  };

  return (
    <Modal disclosure={disclosure}>
      <ModalContent>
        <ModalHeader disclosure={disclosure}>Invite Member</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                disabled={isInviting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Select
                options={roleOptions}
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value as any }))}
                disabled={isInviting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message
              </label>
              <Textarea
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal message to the invitation (optional)"
                rows={3}
                disabled={isInviting}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} disabled={isInviting}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleInviteMember}
              disabled={!inviteForm.email.trim() || isInviting}
            >
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface InviteMemberButtonProps {
  workspace: {
    membership: {
      role: string;
    };
  };
  onOpen: () => void;
}

export function InviteMemberButton({ workspace, onOpen }: InviteMemberButtonProps) {
  if (!workspace.membership || (workspace.membership.role !== "owner" && workspace.membership.role !== "admin")) {
    return null;
  }

  return (
    <Button
      onClick={onOpen}
      variant="outline"
      size="sm"
      leftIcon={<UserAdd size="16" />}
      className="shrink-0"
    >
      Invite Member
    </Button>
  );
}