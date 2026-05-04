"use client";

type FormBannerProps = {
  type: "error" | "success";
  message: string;
};

export const FormBanner: React.FC<FormBannerProps> = (props) => {
  const { type, message } = props;

  const classes =
    type === "success"
      ? "rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700"
      : "rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700";

  return <p className={classes}>{message}</p>;
}
