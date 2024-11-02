import React, { createContext, useContext, useEffect, useState } from 'react';
import { validateAuthApi } from '../api/authApi';
import { User } from '../interfaces/User';

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateAuth = async () => {
            try {
                const { data, error } = await validateAuthApi();
                if (error) {
                    setUser(null);
                    console.log(error);
                    return;
                }
                setUser(data as User);
            } catch (error) {
                console.error("Unexpected error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        validateAuth();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {!loading && children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};