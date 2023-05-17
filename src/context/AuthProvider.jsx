import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const storedAuth = localStorage.getItem("auth1");
        return storedAuth ? JSON.parse(storedAuth) : {};
    });

    const [socket, setSocket] = useState(""); // State to store socket.id

    useEffect(() => {
        localStorage.setItem("auth1", JSON.stringify(auth));
    }, [auth]);

    useEffect(() => {
        localStorage.setItem("socket", socket); // Persist socketId in local storage
    }, [socket]);

    return (
        <AuthContext.Provider
            value={{ auth, setAuth, socket, setSocket }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
