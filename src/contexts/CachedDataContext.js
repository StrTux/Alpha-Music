import React, {createContext, useContext, useState, useEffect} from 'react';

const CachedDataContext = createContext();

export const CachedDataProvider = ({children}) => {
  const [cachedData, setCachedData] = useState({});

  const updateCachedData = (key, data) => {
    setCachedData(prev => ({
      ...prev,
      [key]: data,
    }));
  };

  const getCachedData = key => {
    return cachedData[key];
  };

  return (
    <CachedDataContext.Provider
      value={{
        cachedData,
        updateCachedData,
        getCachedData,
      }}>
      {children}
    </CachedDataContext.Provider>
  );
};

export const useCachedData = () => {
  const context = useContext(CachedDataContext);
  if (!context) {
    throw new Error('useCachedData must be used within a CachedDataProvider');
  }
  return context;
}; 