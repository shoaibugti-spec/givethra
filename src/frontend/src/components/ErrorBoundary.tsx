import { AlertTriangle, RefreshCw } from "lucide-react";
import type React from "react";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/** Parse the first meaningful line from an error stack into file + line info */
function parseStackLocation(stack: string | undefined): {
  component: string;
  file: string;
  line: string;
} {
  if (!stack) return { component: "Unknown", file: "Unknown", line: "?" };
  // Find the first "at Component (file:line:col)" line
  const lines = stack.split("\n").filter((l) => l.trim().startsWith("at "));
  for (const line of lines) {
    const match = line.match(/at\s+(\S+)\s+\((.+):(\d+):\d+\)/);
    if (match) {
      const [, name, filePath, lineNo] = match;
      const fileName = filePath.split("/").pop() ?? filePath;
      return { component: name, file: fileName, line: lineNo };
    }
    // Arrow functions: at file:line:col
    const bare = line.match(/at\s+(.+):(\d+):\d+$/);
    if (bare) {
      const [, filePath, lineNo] = bare;
      const fileName = filePath.split("/").pop() ?? filePath;
      return { component: "(anonymous)", file: fileName, line: lineNo };
    }
  }
  return { component: "Unknown", file: "Unknown", line: "?" };
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary] Caught error:", error.message);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    console.error("[ErrorBoundary] JS stack:", error.stack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const location = parseStackLocation(error?.stack);

      // Extract component name from React component stack
      const componentStack = errorInfo?.componentStack ?? "";
      const firstComponent = componentStack
        .trim()
        .split("\n")
        .find((l) => l.trim().startsWith("at "))
        ?.replace(/^\s*at\s+/, "")
        .split(" ")[0];

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "540px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* Brand header */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "#0166FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontSize: 18 }}>G</span>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                Givethra
              </span>
            </div>

            {/* Error icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <AlertTriangle
                style={{ width: 32, height: 32, color: "#ef4444" }}
              />
            </div>

            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "0.5rem",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#a1a1aa",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              Something went wrong. Our team has been notified.
            </p>

            {/* Diagnostic card */}
            {error && (
              <div
                style={{
                  background: "#111111",
                  border: "1px solid #27272a",
                  borderRadius: 10,
                  padding: "1rem",
                  textAlign: "left",
                  marginBottom: "1.5rem",
                  overflow: "auto",
                  maxHeight: 240,
                }}
              >
                {/* Component name */}
                {firstComponent && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#0166FF",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Component
                    </span>
                    <code
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: "#f4f4f5",
                        fontFamily: "monospace",
                        marginTop: 2,
                      }}
                    >
                      {firstComponent}
                    </code>
                  </div>
                )}
                {/* File + line */}
                {location.file !== "Unknown" && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#0166FF",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Location
                    </span>
                    <code
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: "#a1a1aa",
                        fontFamily: "monospace",
                        marginTop: 2,
                      }}
                    >
                      {location.file}:{location.line}
                    </code>
                  </div>
                )}
                {/* Error message */}
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#0166FF",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Error
                  </span>
                  <code
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "#f87171",
                      fontFamily: "monospace",
                      marginTop: 2,
                      wordBreak: "break-word",
                    }}
                  >
                    {error.message}
                  </code>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReload}
              data-ocid="error.reload_button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 8,
                background: "#0166FF",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
