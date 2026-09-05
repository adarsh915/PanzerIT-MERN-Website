export default function FrontendNotFound() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh)",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            display: "inline-block",
            margin: "0 20px 0 0",
            padding: "0 20px 0 0",
            fontSize: "26px",
            fontWeight: 600,
            lineHeight: "46px",
            borderRight: "1px solid rgba(0, 0, 0, 0.25)",
            color: "#061153",
          }}
        >
          404
        </h1>
        <div style={{ display: "inline-block" }}>
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 400,
              lineHeight: "46px",
              margin: 0,
              color: "#334155",
            }}
          >
            This page could not be found.
          </h2>
        </div>
      </div>
    </div>
  );
}
