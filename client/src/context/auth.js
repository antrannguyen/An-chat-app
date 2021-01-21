import React, { createContext, useReducer, useContext } from "react";
import jwtDecode from "jwt-decode";

//Create context for Auth, to optimizing the contexts, putting state and dispatch in different provider, this is alternative of using useMemo
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

//initialState for useReducer
let user = null;

//Set user fron the token received in the localStorage, so user dont lost when we refresh the data
const token = localStorage.getItem("token");
if (token) {
	const decodedToken = jwtDecode(token);
	const expiresAt = new Date(decodedToken.exp * 1000);

	if (new Date() > expiresAt) {
		localStorage.removeItem("token");
	} else {
		user = decodedToken;
	}
} else console.log("No token found");

//reducer for useReducer
const authReducer = (state, action) => {
	switch (action.type) {
		case "LOGIN":
			localStorage.setItem("token", action.payload.token);
			return {
				...state,
				user: action.payload,
			};
		case "LOGOUT":
			localStorage.removeItem("token");
			return {
				...state,
				user: null,
			};
		default:
			throw new Error(`Unknown action type: ${action.type}`);
	}
};

export const AuthProvider = ({ children }) => {
	// use useState of useReducer to optimizing the context (useReducer(reducer, initialState))
	const [state, dispatch] = useReducer(authReducer, { user });

	return (
		<AuthDispatchContext.Provider value={dispatch}>
			{/* state must not undefined, meaning user should been return value | null */}
			<AuthStateContext.Provider value={state}>
				{children}
			</AuthStateContext.Provider>
		</AuthDispatchContext.Provider>
	);
};

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
