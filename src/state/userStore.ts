import { createSignal } from "solid-js";

export interface Machine {
    id: string;
    name: string;
    address: string;
}

export interface UserState {
    isAuthenticated: boolean;
    userId?: string;
    username?: string;
    machines: Machine[];
}

const defaultState: UserState = {
    isAuthenticated: false,
    machines: []
};

const [userState, setUserState] = createSignal<UserState>(defaultState);

export const useUser = () => {
    const login = (userId: string, username: string) => {
        setUserState({
            isAuthenticated: true,
            userId,
            username,
            machines: [] // Fetch from server in real app
        });
    };

    const logout = () => {
        setUserState(defaultState);
    };

    const addMachine = (machine: Machine) => {
        setUserState(s => ({ ...s, machines: [...s.machines, machine] }));
    };

    return {
        state: userState,
        login,
        logout,
        addMachine
    };
};
