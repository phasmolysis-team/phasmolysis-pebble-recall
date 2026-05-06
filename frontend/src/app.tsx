import { useAuth } from "./features/auth/hooks/use-auth";
import { AuthPanel } from "./features/auth/components/AuthPanel";
import "./app.css";
import { Pond } from "./pond";

export function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Loading session...
      </div>
    );
  }

  if (auth.user) {
    return <Pond />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem", backgroundColor: "#fafafa" }}>
      <AuthPanel
        user={auth.user}
        isLoading={auth.isLoading}
        error={auth.error}
        onLogin={(payload) => auth.login.mutateAsync(payload)}
        onLogout={() => auth.logout.mutateAsync()}
        onRegister={(payload) => auth.register.mutateAsync(payload)}
        isLoginPending={auth.login.isPending}
        isLogoutPending={auth.logout.isPending}
        isRegisterPending={auth.register.isPending}
        loginError={(auth.login.error as Error) ?? null}
        registerError={(auth.register.error as Error) ?? null}
      />
    </div>
  );
}
