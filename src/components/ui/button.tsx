import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Button as BaseButton } from "react-daisyui";
import { Link } from "react-router-dom";

type ButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ href, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        tag={href ? Link : undefined}
        {...props}
        {...(href ? { to: href } : {})}
      />
    );
  }
);

export default Button;
