import { telemetryCrash, TelemetryService } from "@/services/TelemetryService";
import React from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    telemetryCrash(error.message, error.stack || "", {
      component_stack: errorInfo.componentStack,
      error_name: error.name,
      timestamp: Date.now(),
    });

    const payload = TelemetryService.getTelemetryInfo({
      event: "crash",
      message: error.message,
      stacktrace: error.stack,
    });

    if (payload) {
      TelemetryService.sendTelemetry(payload).catch(() => {});
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>{this.state.error?.message}</Text>

              {this.state.errorInfo && (
                <Text style={styles.stackTrace}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}

              {this.state.error?.stack && (
                <Text style={styles.stackTrace}>{this.state.error.stack}</Text>
              )}
            </View>

            <Text style={styles.info}>
              This error has been reported to our monitoring system. We&pos;ll
              investigate and fix it as soon as possible.
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              title="Try again"
              onPress={this.handleReload}
              color="#007AFF"
            />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  errorBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ff3b30",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff3b30",
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 11,
    color: "#555",
    fontFamily: "Courier New",
    lineHeight: 16,
  },
  info: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
});

export default ErrorBoundary;
