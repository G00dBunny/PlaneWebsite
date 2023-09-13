import { createContext, useContext, useState } from "react";

const Context = createContext()

export const PlayProvider = ({ children }) => {
    const [play, setPlay] = useState(false);

    return (
        <Context.Provider value ={{
            play,
            setPlay,
        }}>
            {children}
        </Context.Provider>
    )
}

export const usePlay = () => {
    const context = useContext(Context);
  
    if (context === undefined) {
      throw new Error("usePlay must be used within a PlayProvider");
    }
  
    return context;
};