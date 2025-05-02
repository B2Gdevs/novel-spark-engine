
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface EntityConfirmationCardProps {
  entityType: 'character' | 'scene' | 'page' | 'place';
  entityData: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EntityConfirmationCard({ 
  entityType, 
  entityData, 
  onConfirm, 
  onCancel 
}: EntityConfirmationCardProps) {
  return (
    <div className="flex justify-start animate-fade-in-up mx-4">
      <div className="bg-amber-900/40 border border-amber-500/30 rounded-2xl px-6 py-4 max-w-[90%] shadow-md">
        <p className="text-amber-200 font-medium mb-3">
          {`Ready to create a new ${entityType}:`}
        </p>
        {entityType === 'character' && (
          <div className="space-y-1.5 mb-4">
            <p><span className="text-amber-400">Name:</span> {entityData.name}</p>
            <p><span className="text-amber-400">Role:</span> {entityData.role}</p>
            <p><span className="text-amber-400">Description:</span> {entityData.description}</p>
            {entityData.traits && entityData.traits.length > 0 && (
              <p><span className="text-amber-400">Traits:</span> {entityData.traits.join(', ')}</p>
            )}
          </div>
        )}
        {entityType === 'scene' && (
          <div className="space-y-1.5 mb-4">
            <p><span className="text-amber-400">Title:</span> {entityData.title}</p>
            <p><span className="text-amber-400">Description:</span> {entityData.description}</p>
            {entityData.location && (
              <p><span className="text-amber-400">Location:</span> {entityData.location}</p>
            )}
          </div>
        )}
        {entityType === 'page' && (
          <div className="space-y-1.5 mb-4">
            <p><span className="text-amber-400">Title:</span> {entityData.title}</p>
            <p><span className="text-amber-400">Content:</span> {entityData.content?.substring(0, 100)}...</p>
          </div>
        )}
        {entityType === 'place' && (
          <div className="space-y-1.5 mb-4">
            <p><span className="text-amber-400">Name:</span> {entityData.name}</p>
            <p><span className="text-amber-400">Description:</span> {entityData.description}</p>
            {entityData.geography && (
              <p><span className="text-amber-400">Geography:</span> {entityData.geography}</p>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white flex gap-1.5"
            onClick={onConfirm}
          >
            <Check className="h-4 w-4" />
            Create
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/50 text-amber-300 hover:bg-amber-950/50"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
