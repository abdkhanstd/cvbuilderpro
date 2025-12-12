"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, Trash2, Edit2, Eye, EyeOff, X, Check } from "lucide-react";

interface Section {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  isCustom: boolean;
}

interface SectionManagerProps {
  sections: Section[];
  onUpdate: (sections: Section[]) => void;
  onClose?: () => void;
}

function SortableSection({ section, onToggle, onRename, onDelete, editingId, setEditingId }: {
  section: Section;
  onToggle: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}) {
  const [editTitle, setEditTitle] = useState(section.title);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveRename = () => {
    if (editTitle.trim()) {
      onRename(section.id, editTitle.trim());
      setEditingId(null);
    }
  };

  const handleCancelRename = () => {
    setEditTitle(section.title);
    setEditingId(null);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
        !section.enabled ? "opacity-50" : ""
      }`}
    >
      <button
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </button>

      <div className="flex-1">
        {editingId === section.id ? (
          <div className="flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename();
                if (e.key === 'Escape') handleCancelRename();
              }}
              className="h-8"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveRename}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelRename}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <>
            <span className="font-medium">{section.title}</span>
            {section.isCustom && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                Custom
              </span>
            )}
          </>
        )}
      </div>

      {editingId !== section.id && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(section.id)}
          >
            {section.enabled ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>

          {/* Only show rename for sections other than design and layout */}
          {section.id !== 'design' && section.id !== 'layout' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditTitle(section.title);
                setEditingId(section.id);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}

          {section.isCustom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(section.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function SectionManager({ sections: initialSections, onUpdate, onClose }: SectionManagerProps) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
        ...s,
        order: i,
      }));

      setSections(newSections);
      onUpdate(newSections);
    }
  };

  const handleToggle = (id: string) => {
    const newSections = sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSections(newSections);
    onUpdate(newSections);
  };

  const handleRename = (id: string, newTitle: string) => {
    const newSections = sections.map((s) =>
      s.id === id ? { ...s, title: newTitle } : s
    );
    setSections(newSections);
    onUpdate(newSections);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      const newSections = sections.filter((s) => s.id !== id);
      setSections(newSections);
      onUpdate(newSections);
    }
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: Section = {
      id: `custom-${Date.now()}`,
      title: newSectionTitle.trim(),
      enabled: true,
      order: sections.length,
      isCustom: true,
    };

    const newSections = [...sections, newSection];
    setSections(newSections);
    onUpdate(newSections);
    setNewSectionTitle("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manage Sections</h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Drag sections to reorder, toggle visibility, or add custom sections.
        </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 mb-4">
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onToggle={handleToggle}
                onRename={handleRename}
                onDelete={handleDelete}
                editingId={editingId}
                setEditingId={setEditingId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Add Custom Section</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Section title (e.g., Hobbies, Volunteer Work)"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSection()}
          />
          <Button onClick={handleAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </Card>
    </div>
  );
}
