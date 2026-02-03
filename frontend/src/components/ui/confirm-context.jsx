import { createContext } from "react";

// Keep the context in its own file to avoid React Fast Refresh warnings.
export const ConfirmContext = createContext(null);

export default ConfirmContext;
