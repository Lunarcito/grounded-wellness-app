"use client";

type TimezoneInputProps = {
  name?: string;
};

function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function TimezoneInput({ name = "timezone" }: TimezoneInputProps) {
  const timeZone = getBrowserTimeZone();

  return <input type="hidden" name={name} value={timeZone} />;
}
