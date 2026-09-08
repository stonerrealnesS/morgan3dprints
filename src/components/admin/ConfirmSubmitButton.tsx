"use client";

// A plain <button type="submit"> that asks for confirmation before letting
// the enclosing <form>'s server action run. Needs to be a Client Component
// since window.confirm() only exists in the browser.
export function ConfirmSubmitButton({
  confirmMessage,
  children,
  className,
  style,
}: {
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
