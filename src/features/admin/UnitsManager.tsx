import React, { useState, useEffect } from 'react';
import { UnitOfMeasure } from '@shared/types';
import { getStoredUnits, saveStoredUnits } from '@shared/utils/storageUtils';
import Modal from '@shared/components/Modal';
import ConfirmationModal from '@shared/components/ConfirmationModal';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

interface UnitsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnitsManager: React.FC<UnitsManagerProps> = ({ isOpen, onClose }) => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    unit_name: '',
    abbreviation: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      const storedUnits = getStoredUnits();
      setUnits(storedUnits);
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({ unit_name: '', abbreviation: '', description: '' });
    setEditingUnit(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unit_name.trim() || !formData.abbreviation.trim()) {
      return;
    }

    if (editingUnit) {
      // Update existing unit
      const updatedUnits = units.map(unit =>
        unit.id === editingUnit.id
          ? { ...unit, ...formData }
          : unit
      );
      setUnits(updatedUnits);
      saveStoredUnits(updatedUnits);
    } else {
      // Add new unit
      const newUnit: UnitOfMeasure = {
        id: generateId(),
        ...formData
      };
      const updatedUnits = [...units, newUnit];
      setUnits(updatedUnits);
      saveStoredUnits(updatedUnits);
    }

    resetForm();
  };

  const handleEdit = (unit: UnitOfMeasure) => {
    setEditingUnit(unit);
    setFormData({
      unit_name: unit.unit_name,
      abbreviation: unit.abbreviation,
      description: unit.description || ''
    });
  };

  const handleDelete = (unitId: string) => {
    const updatedUnits = units.filter(unit => unit.id !== unitId);
    setUnits(updatedUnits);
    saveStoredUnits(updatedUnits);
    setShowDeleteConfirm(null);
  };

  const isUnitInUse = (unitId: string): boolean => {
    // TODO: Check if unit is used in any quick actions
    // For now, always allow deletion
    return false;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Units of Measure">
        <div className="space-y-4">
          {/* Add/Edit Form */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              {editingUnit ? 'Edit Unit' : 'Add New Unit'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit Name *
                </label>
                <input
                  type="text"
                  value={formData.unit_name}
                  onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Kilogram"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Abbreviation *
                </label>
                <input
                  type="text"
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., kg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-textOnPrimary rounded-md hover:bg-primaryDark transition-colors"
                >
                  {editingUnit ? 'Update' : 'Add'} Unit
                </button>
                {editingUnit && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Units List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Your Units</h3>
            {units.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No units created yet.</p>
                <p className="text-sm mt-1">Add your first unit above to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{unit.unit_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {unit.abbreviation}
                        {unit.description && ` • ${unit.description}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(unit.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        disabled={isUnitInUse(unit.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
        title="Delete Unit"
        message="Are you sure you want to delete this unit? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default UnitsManager;
