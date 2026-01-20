import React, { useState } from 'react';
import { UnitOfMeasure, RelatedUnit } from '@shared/types';
import Modal from '@shared/components/Modal';
import ConfirmationModal from '@shared/components/ConfirmationModal';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Icons (using simple SVG components)
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface UnitsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  units: UnitOfMeasure[];
  relatedUnits: RelatedUnit[];
  onUnitsChange: (units: UnitOfMeasure[]) => void;
  onRelatedUnitsChange: (relatedUnits: RelatedUnit[]) => void;
}

const UnitsManager: React.FC<UnitsManagerProps> = ({ 
  isOpen, 
  onClose, 
  units, 
  relatedUnits, 
  onUnitsChange, 
  onRelatedUnitsChange 
}) => {
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showRelatedDeleteConfirm, setShowRelatedDeleteConfirm] = useState<string | null>(null);
  const [showAddConversion, setShowAddConversion] = useState(false);
  const [formData, setFormData] = useState({
    unit_name: '',
    abbreviation: '',
    description: ''
  });
  const [conversionForm, setConversionForm] = useState({
    baseUnitId: '',
    quantity: '',
    relatedUnitId: ''
  });

  const resetForm = () => {
    setFormData({ unit_name: '', abbreviation: '', description: '' });
    setEditingUnit(null);
  };

  const resetConversionForm = () => {
    setConversionForm({ baseUnitId: '', quantity: '', relatedUnitId: '' });
    setShowAddConversion(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unit_name.trim() || !formData.abbreviation.trim()) {
      return;
    }

    let updatedUnits: UnitOfMeasure[];
    
    if (editingUnit) {
      updatedUnits = units.map(unit => 
        unit.id === editingUnit.id 
          ? { 
              ...unit, 
              unit_name: formData.unit_name.trim(), 
              abbreviation: formData.abbreviation.trim(),
              description: formData.description.trim()
            }
          : unit
      );
    } else {
      const newUnit: UnitOfMeasure = {
        id: generateId(),
        unit_name: formData.unit_name.trim(),
        abbreviation: formData.abbreviation.trim(),
        description: formData.description.trim(),
        isBaseUnit: false
      };
      updatedUnits = [...units, newUnit];
    }

    onUnitsChange(updatedUnits);
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

  const handleDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;

    // Remove unit and any related units that reference it
    const updatedUnits = units.filter(unit => unit.id !== showDeleteConfirm);
    const updatedRelatedUnits = relatedUnits.filter(
      ru => ru.baseUnitId !== showDeleteConfirm && ru.relatedUnitId !== showDeleteConfirm
    );

    onUnitsChange(updatedUnits);
    onRelatedUnitsChange(updatedRelatedUnits);
    setShowDeleteConfirm(null);
  };

  const handleAddConversion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!conversionForm.baseUnitId || !conversionForm.relatedUnitId || !conversionForm.quantity) {
      return;
    }

    const quantity = parseFloat(conversionForm.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return;
    }

    // Calculate conversion factor: 1 related unit = quantity base units
    const conversionFactor = quantity;

    const newRelatedUnit: RelatedUnit = {
      id: generateId(),
      baseUnitId: conversionForm.baseUnitId,
      relatedUnitId: conversionForm.relatedUnitId,
      conversionFactor
    };

    // Update base unit to mark it as base unit
    const updatedUnits = units.map(unit => 
      unit.id === conversionForm.baseUnitId 
        ? { ...unit, isBaseUnit: true }
        : unit.id === conversionForm.relatedUnitId 
          ? { ...unit, isBaseUnit: false }
          : unit
    );

    const updatedRelatedUnits = [...relatedUnits, newRelatedUnit];

    onUnitsChange(updatedUnits);
    onRelatedUnitsChange(updatedRelatedUnits);
    resetConversionForm();
  };

  const handleDeleteRelatedUnit = (id: string) => {
    setShowRelatedDeleteConfirm(id);
  };

  const confirmDeleteRelatedUnit = () => {
    if (!showRelatedDeleteConfirm) return;

    const relatedUnitToDelete = relatedUnits.find(ru => ru.id === showRelatedDeleteConfirm);
    if (!relatedUnitToDelete) return;

    // Remove the related unit
    const updatedRelatedUnits = relatedUnits.filter(ru => ru.id !== showRelatedDeleteConfirm);

    // Check if the base unit still has other related units
    const baseUnitStillHasRelations = updatedRelatedUnits.some(
      ru => ru.baseUnitId === relatedUnitToDelete.baseUnitId
    );

    // Update units: remove base unit tag if no more relations
    const updatedUnits = units.map(unit => {
      if (unit.id === relatedUnitToDelete.baseUnitId && !baseUnitStillHasRelations) {
        return { ...unit, isBaseUnit: false };
      }
      return unit;
    });

    onUnitsChange(updatedUnits);
    onRelatedUnitsChange(updatedRelatedUnits);
    setShowRelatedDeleteConfirm(null);
  };

  const getRelatedUnitsForBaseUnit = (baseUnitId: string) => {
    return relatedUnits.filter(ru => ru.baseUnitId === baseUnitId);
  };

  const getBaseUnits = () => {
    return units.filter(unit => unit.isBaseUnit);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Units & Conversions Manager">
      <div className="space-y-6">
        {/* Add/Edit Unit Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Add Unit</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Unit Name (e.g., Gram)"
                value={formData.unit_name}
                onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                className="p-2 border rounded-lg focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Abbreviation (e.g., g)"
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                className="p-2 border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryDark transition-colors"
            >
              {editingUnit ? 'Update Unit' : 'Add Unit'}
            </button>
          </form>
        </div>

        {/* Add Conversion Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Related Units</h3>
            <button
              onClick={() => setShowAddConversion(!showAddConversion)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
            >
              {showAddConversion ? <ChevronDownIcon /> : <ChevronRightIcon />}
              Add Related Units
            </button>
          </div>
          
          {showAddConversion && (
            <div className="mb-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">Add New Conversion</h4>
              </div>
              <form onSubmit={handleAddConversion} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {/* Base Unit Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Base Unit</label>
                    <select
                      value={conversionForm.baseUnitId}
                      onChange={(e) => setConversionForm({ ...conversionForm, baseUnitId: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-sm bg-white dark:bg-gray-700 transition-all"
                    >
                      <option value="">Select Base Unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.unit_name} ({unit.abbreviation})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g., 1000"
                      value={conversionForm.quantity}
                      onChange={(e) => setConversionForm({ ...conversionForm, quantity: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-sm bg-white dark:bg-gray-700 transition-all"
                      step="any"
                      min="0"
                    />
                  </div>

                  {/* Related Unit Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Related Unit</label>
                    <select
                      value={conversionForm.relatedUnitId}
                      onChange={(e) => setConversionForm({ ...conversionForm, relatedUnitId: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-sm bg-white dark:bg-gray-700 transition-all"
                    >
                      <option value="">Select Related Unit</option>
                      {units
                        .filter(unit => unit.id !== conversionForm.baseUnitId)
                        .map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unit_name} ({unit.abbreviation})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Conversion Preview */}
                {conversionForm.baseUnitId && conversionForm.relatedUnitId && conversionForm.quantity && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-200 dark:border-green-700 shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Result</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      1 {units.find(u => u.id === conversionForm.relatedUnitId)?.abbreviation} = {conversionForm.quantity} {units.find(u => u.id === conversionForm.baseUnitId)?.abbreviation}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {units.find(u => u.id === conversionForm.relatedUnitId)?.unit_name} → {units.find(u => u.id === conversionForm.baseUnitId)?.unit_name}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  Add Conversion
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Units List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">All Units</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {units.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No units added yet</p>
            ) : (
              units.map(unit => (
                <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{unit.unit_name} ({unit.abbreviation})</div>
                      {unit.description && (
                        <div className="text-sm text-gray-500">{unit.description}</div>
                      )}
                      {unit.isBaseUnit && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded mt-1">
                          Base Unit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(unit)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit Unit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Unit"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversions List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Conversions</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {relatedUnits.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No conversions added yet</p>
            ) : (
              relatedUnits.map(ru => {
                const baseUnit = units.find(u => u.id === ru.baseUnitId);
                const relatedUnit = units.find(u => u.id === ru.relatedUnitId);
                return (
                  <div key={ru.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">
                        1 {relatedUnit?.abbreviation} = {ru.conversionFactor} {baseUnit?.abbreviation}
                      </div>
                      <div className="text-sm text-gray-500">
                        {relatedUnit?.unit_name} → {baseUnit?.unit_name}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRelatedUnit(ru.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Conversion"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>

    {/* Delete Unit Confirmation */}
    <ConfirmationModal
      isOpen={!!showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(null)}
      onConfirm={confirmDelete}
      title="Delete Unit?"
      message="This will also delete all conversions related to this unit. Are you sure?"
      confirmText="Delete"
      isDestructive={true}
    />

    {/* Delete Related Unit Confirmation */}
    <ConfirmationModal
      isOpen={!!showRelatedDeleteConfirm}
      onClose={() => setShowRelatedDeleteConfirm(null)}
      onConfirm={confirmDeleteRelatedUnit}
      title="Delete Conversion?"
      message="Are you sure you want to delete this conversion?"
      confirmText="Delete"
      isDestructive={true}
    />
  </>
  );
};

export default UnitsManager;
