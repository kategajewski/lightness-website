"use client";
export function PrintIntakeButton() {
  return <button type="button" className="button-pill" onClick={() => window.print()}>Print or save a copy</button>;
}
