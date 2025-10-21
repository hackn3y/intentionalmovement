import { useEffect } from 'react';
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
    console.log('[useKeyboardShortcuts] Setting up, Platform.OS:', Platform.OS);
    console.log('[useKeyboardShortcuts] Shortcuts:', Object.keys(shortcuts));

    // Only enable keyboard shortcuts on web
    if (Platform.OS !== 'web') {
      console.log('[useKeyboardShortcuts] Not web, skipping');
      return;
    }

    const handleKeyPress = (event) => {
      console.log('[useKeyboardShortcuts] Key event:', event.key, 'Ctrl:', event.ctrlKey);
      // Build key combination string
      let key = event.key;
      const modifiers = [];

      if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
      if (event.shiftKey) modifiers.push('shift');
      if (event.altKey) modifiers.push('alt');

      const keyCombo = modifiers.length > 0
        ? `${modifiers.join('+')}+${key}`
        : key;

      console.log('[useKeyboardShortcuts] Built keyCombo:', keyCombo);
      console.log('[useKeyboardShortcuts] Available shortcuts:', Object.keys(shortcuts));

      // Check for exact match
      if (shortcuts[keyCombo]) {
        console.log('[useKeyboardShortcuts] EXACT MATCH! Executing...');
        event.preventDefault();
        shortcuts[keyCombo](event);
        return;
      }

      // Check for case-insensitive match
      const lowerKeyCombo = keyCombo.toLowerCase();
      console.log('[useKeyboardShortcuts] Checking lowercase:', lowerKeyCombo);
      if (shortcuts[lowerKeyCombo]) {
        console.log('[useKeyboardShortcuts] CASE-INSENSITIVE MATCH! Executing...');
        event.preventDefault();
        shortcuts[lowerKeyCombo](event);
        return;
      }

      console.log('[useKeyboardShortcuts] No match found');
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
  useKeyboardShortcuts({
    [multiline ? 'ctrl+enter' : 'enter']: () => {
      if (!disabled) {
        onSubmit();
      }
    },
  }, [onSubmit, disabled]);
};

/**
 * Hook for handling Escape key to go back/close
 * @param {Function} onEscape - Escape handler (usually navigation.goBack)
 */
export const useEscapeToClose = (onEscape) => {
  useKeyboardShortcuts({
    'Escape': onEscape,
  }, [onEscape]);
};
