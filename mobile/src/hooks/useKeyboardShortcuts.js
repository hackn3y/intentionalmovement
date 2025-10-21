import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} shortcuts - Object mapping keys to handlers
 * @param {Array} deps - Dependencies array
 *
 * Example usage:
 * useKeyboardShortcuts({
 *   'Enter': () => handleSubmit(),
 *   'Escape': () => navigation.goBack(),
 *   'ctrl+k': () => openSearch(),
 * }, [handleSubmit, navigation]);
 */
export const useKeyboardShortcuts = (shortcuts, deps = []) => {
  useEffect(() => {
    // Only enable keyboard shortcuts on web
    if (Platform.OS !== 'web') {
      return;
    }

    const handleKeyPress = (event) => {
      // Build key combination string
      let key = event.key;
      const modifiers = [];

      if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
      if (event.shiftKey) modifiers.push('shift');
      if (event.altKey) modifiers.push('alt');

      const keyCombo = modifiers.length > 0
        ? `${modifiers.join('+')}+${key}`
        : key;

      // Check for exact match
      if (shortcuts[keyCombo]) {
        event.preventDefault();
        shortcuts[keyCombo](event);
        return;
      }

      // Check for case-insensitive match
      const lowerKeyCombo = keyCombo.toLowerCase();
      if (shortcuts[lowerKeyCombo]) {
        event.preventDefault();
        shortcuts[lowerKeyCombo](event);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, deps);
};

/**
 * Hook for handling Enter key to submit forms
 * @param {Function} onSubmit - Submit handler
 * @param {boolean} disabled - Whether submission is disabled
 * @param {boolean} multiline - If true, requires Ctrl+Enter instead of just Enter
 */
export const useEnterToSubmit = (onSubmit, disabled = false, multiline = false) => {
  // Use refs to avoid stale closures
  const disabledRef = useRef(disabled);
  const onSubmitRef = useRef(onSubmit);

  // Update refs on every render
  disabledRef.current = disabled;
  onSubmitRef.current = onSubmit;

  useKeyboardShortcuts({
    [multiline ? 'ctrl+enter' : 'enter']: () => {
      if (!disabledRef.current) {
        onSubmitRef.current();
      }
    },
  }, []); // Empty deps - handler uses refs which always have current values
};

/**
 * Hook for handling Escape key to go back/close
 * @param {Function} onEscape - Escape handler (usually navigation.goBack)
 */
export const useEscapeToClose = (onEscape) => {
  const onEscapeRef = useRef(onEscape);

  // Update ref on every render
  onEscapeRef.current = onEscape;

  useKeyboardShortcuts({
    'Escape': () => onEscapeRef.current(),
  }, []); // Empty deps - handler uses ref which always has current value
};
