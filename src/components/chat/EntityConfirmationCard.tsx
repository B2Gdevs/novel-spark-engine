
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
    <div className="flex justify-start animate-fade-in-up">
      <div className="bg-amber-900/40 border border-amber-500/30 rounded-2xl px-4 py-3 max-w-[80%]">
        <p className="text-amber-200 font-medium mb-2">
          {`Ready to create a new ${entityType}:`}
        </p>
        {entityType === 'character' && (
          <div className="space-y-1 mb-3">
            <p><span className="text-amber-400">Name:</span> {entityData.name}</p>
            <p><span className="text-amber-400">Role:</span> {entityData.role}</p>
            <p><span className="text-amber-400">Description:</span> {entityData.description}</p>
            {entityData.traits.length > 0 && (
              <p><span className="text-amber-400">Traits:</span> {entityData.traits.join(', ')}</p>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white flex gap-1"
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
