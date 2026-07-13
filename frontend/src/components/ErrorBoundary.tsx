import React from "react";

import { Logo } from "@/components/Common/Logo";

type ErrorBoundaryState = { hasError: boolean };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="error-recovery" role="alert">
        <Logo variant="icon" asLink={false} />
        <p className="eyebrow">Goodluck Igbokwe</p>
        <h1>Something went wrong.</h1>
        <p>Refresh the page to continue. Your saved content is still protected.</p>
        <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
          Refresh page
        </button>
      </main>
    );
  }
}
