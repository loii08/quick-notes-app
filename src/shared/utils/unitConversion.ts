/**
 * Unit conversion utilities
 */

import { UnitOfMeasure, RelatedUnit } from '@shared/types';

/**
 * Converts a quantity from one unit to another using related units
 * @param quantity - The quantity to convert
 * @param fromUnitId - The source unit ID
 * @param toUnitId - The target unit ID
 * @param units - All available units
 * @param relatedUnits - All related unit conversions
 * @returns Converted quantity in target units, or null if conversion not possible
 */
export const convertQuantity = (
  quantity: number,
  fromUnitId: string,
  toUnitId: string,
  units: UnitOfMeasure[],
  relatedUnits: RelatedUnit[]
): number | null => {
  // If same unit, no conversion needed
  if (fromUnitId === toUnitId) {
    return quantity;
  }

  const fromUnit = units.find(u => u.id === fromUnitId);
  const toUnit = units.find(u => u.id === toUnitId);
  
  if (!fromUnit || !toUnit) {
    return null;
  }

  // Check if both are base units (no conversion needed)
  if (fromUnit.isBaseUnit && toUnit.isBaseUnit) {
    return quantity;
  }

  // Find conversion path: from -> base -> to
  let conversionFactor = 1;
  
  // Step 1: Convert from unit to base unit
  if (!fromUnit.isBaseUnit) {
    const fromToBase = relatedUnits.find(ru => 
      ru.relatedUnitId === fromUnitId
    );
    if (fromToBase) {
      conversionFactor *= fromToBase.conversionFactor;
    } else {
      // No direct conversion found
      return null;
    }
  }

  // Step 2: Convert from base unit to target unit
  if (!toUnit.isBaseUnit) {
    const baseToTarget = relatedUnits.find(ru => 
      ru.baseUnitId === toUnitId && ru.relatedUnitId === fromUnitId
    );
    if (baseToTarget) {
      conversionFactor *= baseToTarget.conversionFactor;
    } else {
      // No direct conversion found
      return null;
    }
  }

  return quantity * conversionFactor;
};

/**
 * Gets the base unit for a given unit
 * @param unitId - The unit ID to find base unit for
 * @param units - All available units
 * @param relatedUnits - All related unit conversions
 * @returns Base unit ID, or null if not found
 */
export const getBaseUnitForUnit = (
  unitId: string,
  units: UnitOfMeasure[],
  relatedUnits: RelatedUnit[]
): string | null => {
  const unit = units.find(u => u.id === unitId);
  if (!unit) return null;

  // If it's already a base unit, return itself
  if (unit.isBaseUnit) {
    return unitId;
  }

  // Find the base unit this unit converts to
  const relatedUnit = relatedUnits.find(ru => ru.relatedUnitId === unitId);
  if (relatedUnit) {
    return relatedUnit.baseUnitId;
  }

  return null;
};

/**
 * Gets all related units for a base unit
 * @param baseUnitId - The base unit ID
 * @param relatedUnits - All related unit conversions
 * @returns Array of related units for the base unit
 */
export const getRelatedUnitsForBaseUnit = (
  baseUnitId: string,
  relatedUnits: RelatedUnit[]
): RelatedUnit[] => {
  return relatedUnits.filter(ru => ru.baseUnitId === baseUnitId);
};

/**
 * Formats a quantity with unit for display
 * @param quantity - The quantity in base units
 * @param unitId - The unit ID to display with
 * @param units - All available units
 * @returns Formatted string
 */
export const formatQuantityWithUnit = (
  quantity: number,
  unitId: string,
  units: UnitOfMeasure[]
): string => {
  const unit = units.find(u => u.id === unitId);
  if (!unit) return `${quantity}`;
  
  return `${quantity} ${unit.abbreviation}`;
};
