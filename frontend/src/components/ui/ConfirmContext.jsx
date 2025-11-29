import React, { useState } from "react";
import { ConfirmContext } from "./confirm-context";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: "",
    message: "",
    resolve: null,
  });

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  };

  const handleClose = (result) => {
    if (state.resolve) state.resolve(result);
    setState({ open: false, title: "", message: "", resolve: null });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => handleClose(false)}
          />
          <Card className="z-10 w-full max-w-md">
            <CardHeader>
              <CardTitle>{state.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{state.message}</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => handleClose(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={() => handleClose(true)}>
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// NOTE: `useConfirm` is provided in a dedicated hook file so React Fast Refresh
// will not complain about files that export both components and plain functions.
