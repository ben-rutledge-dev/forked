"use client";

type Props = {
  type: "error" | "success";
  message: string;
};

export function FormBanner({ type, message }: Props) {
  const classes =
    type === "success"
      ? "rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700"
      : "rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700";

  return <p className={classes}>{message}</p>;
}
