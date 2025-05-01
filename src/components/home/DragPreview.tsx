
import React from 'react';
import ReactDOM from 'react-dom';

interface DragPreviewProps {
  draggedBookPreview: {
    id: string;
    title: string;
    position: { x: number; y: number };
  } | null;
}

export function DragPreview({ draggedBookPreview }: DragPreviewProps) {
  if (!draggedBookPreview || !document.body) return null;
  
  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed',
        left: `${draggedBookPreview.position.x - 100}px`,
        top: `${draggedBookPreview.position.y - 50}px`,
        transform: 'scale(0.8)',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.85,
        transition: 'box-shadow 0.2s ease',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        width: '200px'
      }}
      className="animate-fade-in"
    >
      <div className="bg-zinc-900 border border-purple-500 rounded-md p-3">
        <h3 className="font-bold text-white">{draggedBookPreview.title}</h3>
      </div>
    </div>,
    document.body
  );
}
