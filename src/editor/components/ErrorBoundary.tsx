import { Component, ReactNode, ErrorInfo } from "react";
import { CustomDialog, CustomDialogProps } from "./CustomDialog";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  static ref: ErrorBoundary | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };

    ErrorBoundary.ref = this;
  }

  static showError(error: Error) {
    if (ErrorBoundary.ref) {
      ErrorBoundary.ref.setState({ hasError: true, error });
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const dialogProps: CustomDialogProps = {
        isOpen: true,
        onClose: () => {
          window.location.reload();
        },
        title: "Fail, we have. But hope, we do not lose.",
        text: "An unexpected error occurred. Refer to the console output for details. This typically indicates a misconfiguration in the navigation mesh parameters. If the problem persists, you can submit an issue in the GitHub repository by clicking the GitHub icon in the footer.",
        buttons: [
          {
            label: "Reload page",
            closeOnClick: true,
          },
        ],
      };

      return <CustomDialog {...dialogProps} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
