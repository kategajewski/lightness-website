"use client";

import { useState } from "react";

export function FormSecurityFields() {
  const [startedAt] = useState(() => Date.now());

  return (
    <>
      <input type="hidden" name="startedAt" value={startedAt} />
      <label
        aria-hidden="true"
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
      >
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </>
  );
}
