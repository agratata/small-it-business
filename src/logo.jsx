
export default function Logo({
  size = 34,
  showName = true,
  onClick,
  className = "",
}) {
  const inner = (
    <>
      <img
        src="/logo-tile.png"
        alt={showName ? "" : "Get Studious"}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.26),
          display: "block",
          flex: "none",
        }}
      />
      {showName && (
        <span
          style={{
            fontWeight: 700,
            fontSize: Math.max(15, Math.round(size * 0.55)),
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          Get Studious
        </span>
      )}
    </>
  );

  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: Math.round(size * 0.32),
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        style={{ ...style, background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit" }}
        aria-label="Get Studious — back to the home page"
      >
        {inner}
      </button>
    );
  }

  return (
    <span className={className} style={style}>
      {inner}
    </span>
  );
}