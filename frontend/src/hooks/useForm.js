// hooks/useForm.js
// Generic controlled-form hook with validation support.

import { useState, useCallback } from 'react';

/**
 * useForm — manages form values, errors, and validation.
 *
 * @param {Object} initialValues   Initial field values
 * @param {Function} validate      Function(values) → errors object
 */
const useForm = (initialValues = {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change if field was previously touched
    if (touched[name]) {
      const validationErrors = validate({ ...values, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
    }
  }, [values, touched, validate]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validationErrors = validate({ ...values, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
  }, [values, validate]);

  const validateAll = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
  };
};

export default useForm;
