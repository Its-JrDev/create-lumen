interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Lumen</h2>
      </header>
      <main
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </main>
      <footer
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--color-border)",
          textAlign: "center",
          color: "var(--color-muted)",
        }}
      >
        <p>Built with Lumen</p>
      </footer>
    </div>
  );
}
