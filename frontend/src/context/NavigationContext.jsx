/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";

const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  const [blockNavigation, setBlockNavigation] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  const [onConfirmLeave, setOnConfirmLeave] = useState(null);

  const requestNavigation = useCallback(
    (path) => {
      if (blockNavigation) {
        setPendingPath(path);
        setShowWarningModal(true);
        return false; // Navigation blocked
      }
      return true; // Navigation allowed
    },
    [blockNavigation]
  );

  const confirmLeave = useCallback(() => {
    if (onConfirmLeave) {
      onConfirmLeave();
    }
    setShowWarningModal(false);
    const path = pendingPath;
    setPendingPath(null);
    return path;
  }, [pendingPath, onConfirmLeave]);

  const cancelLeave = useCallback(() => {
    setShowWarningModal(false);
    setPendingPath(null);
  }, []);

  const registerBlocker = useCallback((shouldBlock, onLeave) => {
    setBlockNavigation(shouldBlock);
    setOnConfirmLeave(() => onLeave);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        blockNavigation,
        showWarningModal,
        pendingPath,
        requestNavigation,
        confirmLeave,
        cancelLeave,
        registerBlocker,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
