import React from "react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

export default function LoadingButton({
  children,
  loading,
  className,
  variant,
  type = "submit",
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      type={type}
      variant={variant}
      className={className}
      disabled={loading || props.disabled}
    >
      {loading && <Spinner />}
      {children}
    </Button>
  );
}
