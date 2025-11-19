import { Component, createContext, useContext, JSX, createEffect } from "solid-js";
import { useVisitor } from "./visitorStore";
import { useSession } from "./sessionStore";
import { useUser } from "./userStore";

const RootStateContext = createContext();

export const RootStateProvider: Component<{ children: JSX.Element }> = (props) => {
    const visitor = useVisitor();
    const session = useSession();
    const user = useUser();

    // Apply theme effect
    createEffect(() => {
        const theme = visitor.state().theme;
        const root = document.documentElement;

        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    });

    const value = {
        visitor,
        session,
        user
    };

    return (
        <RootStateContext.Provider value={value}>
            {props.children}
        </RootStateContext.Provider>
    );
};

export const useRootState = () => {
    const context = useContext(RootStateContext);
    if (!context) {
        throw new Error("useRootState must be used within a RootStateProvider");
    }
    return context as {
        visitor: ReturnType<typeof useVisitor>;
        session: ReturnType<typeof useSession>;
        user: ReturnType<typeof useUser>;
    };
};
