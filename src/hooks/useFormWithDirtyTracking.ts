import { useState, useRef, useCallback } from "react";

interface UseFormWithDirtyTrackingOptions<T> {
  getFieldValue: (obj: T, key: string) => string;
  setFieldValue: (obj: T, key: string, value: string) => T;
}

export function useFormWithDirtyTracking<T>(options: UseFormWithDirtyTrackingOptions<T>) {
  const { getFieldValue, setFieldValue } = options;
  const [editedData, setEditedData] = useState<T | null>(null);
  const originalDataRef = useRef<T | null>(null);
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  const initialize = useCallback((data: T) => {
    setEditedData({ ...data });
    originalDataRef.current = JSON.parse(JSON.stringify(data));
    setModifiedFields(new Set());
  }, []);

  const handleFieldChange = useCallback((key: string, value: string) => {
    setEditedData(prev => {
      if (!prev || !originalDataRef.current) return prev;
      const updated = setFieldValue(prev, key, value);

      const originalValue = getFieldValue(originalDataRef.current!, key);
      setModifiedFields(prevFields => {
        const newFields = new Set(prevFields);
        if (value !== originalValue) {
          newFields.add(key);
        } else {
          newFields.delete(key);
        }
        return newFields;
      });

      return updated;
    });
  }, [getFieldValue, setFieldValue]);

  const markFieldModified = useCallback((key: string) => {
    setModifiedFields(prev => {
      const newFields = new Set(prev);
      newFields.add(key);
      return newFields;
    });
  }, []);

  const resetForm = useCallback(() => {
    if (originalDataRef.current) {
      setEditedData(JSON.parse(JSON.stringify(originalDataRef.current)));
    }
    setModifiedFields(new Set());
  }, []);

  const getField = useCallback((key: string): string => {
    if (!editedData) return "";
    return getFieldValue(editedData, key);
  }, [editedData, getFieldValue]);

  return {
    editedData,
    setEditedData,
    modifiedFields,
    setModifiedFields,
    hasChanges: modifiedFields.size > 0,
    initialize,
    handleFieldChange,
    markFieldModified,
    resetForm,
    getField
  };
}
