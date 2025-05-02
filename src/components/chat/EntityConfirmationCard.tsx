
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
  // Define colors based on entity type
  const colors = {
    character: {
      bg: 'bg-purple-900/40',
      border: 'border-purple-500/30',
      text: 'text-purple-200',
      label: 'text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700',
      outline: 'border-purple-500/50 text-purple-300 hover:bg-purple-950/50'
    },
    scene: {
      bg: 'bg-blue-900/40',
      border: 'border-blue-500/30',
      text: 'text-blue-200',
      label: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700',
      outline: 'border-blue-500/50 text-blue-300 hover:bg-blue-950/50'
    },
    page: {
      bg: 'bg-green-900/40',
      border: 'border-green-500/30',
      text: 'text-green-200',
      label: 'text-green-400',
      button: 'bg-green-600 hover:bg-green-700',
      outline: 'border-green-500/50 text-green-300 hover:bg-green-950/50'
    },
    place: {
      bg: 'bg-amber-900/40',
      border: 'border-amber-500/30',
      text: 'text-amber-200',
      label: 'text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700',
      outline: 'border-amber-500/50 text-amber-300 hover:bg-amber-950/50'
    }
  };

  const color = colors[entityType];

  return (
    <div className="flex justify-start animate-fade-in-up mx-4">
      <div className={`${color.bg} border ${color.border} rounded-2xl px-6 py-4 max-w-[90%] shadow-md`}>
        <p className={`${color.text} font-medium mb-3`}>
          {`Ready to create a new ${entityType}:`}
        </p>
        {entityType === 'character' && (
          <div className="space-y-1.5 mb-4">
            <p><span className={color.label}>Name:</span> {entityData.name}</p>
            <p><span className={color.label}>Role:</span> {entityData.role}</p>
            <p><span className={color.label}>Description:</span> {entityData.description}</p>
            {entityData.traits && entityData.traits.length > 0 && (
              <p><span className={color.label}>Traits:</span> {entityData.traits.join(', ')}</p>
            )}
          </div>
        )}
        {entityType === 'scene' && (
          <div className="space-y-1.5 mb-4">
            <p><span className={color.label}>Title:</span> {entityData.title}</p>
            <p><span className={color.label}>Description:</span> {entityData.description}</p>
            {entityData.location && (
              <p><span className={color.label}>Location:</span> {entityData.location}</p>
            )}
          </div>
        )}
        {entityType === 'page' && (
          <div className="space-y-1.5 mb-4">
            <p><span className={color.label}>Title:</span> {entityData.title}</p>
            <p><span className={color.label}>Content:</span> {entityData.content?.substring(0, 100)}...</p>
          </div>
        )}
        {entityType === 'place' && (
          <div className="space-y-1.5 mb-4">
            <p><span className={color.label}>Name:</span> {entityData.name}</p>
            <p><span className={color.label}>Description:</span> {entityData.description}</p>
            {entityData.geography && (
              <p><span className={color.label}>Geography:</span> {entityData.geography}</p>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <Button
            size="sm"
            className={`${color.button} text-white flex gap-1.5`}
            onClick={onConfirm}
          >
            <Check className="h-4 w-4" />
            Create
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`${color.outline}`}
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
