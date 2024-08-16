import { LucideIcon } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Button as BaseButton } from "react-daisyui";
import { Link } from "react-router-dom";

type ButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  icon?: LucideIcon;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ href, children, icon: Icon, shape, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        tag={href ? Link : undefined}
        shape={Icon && !children ? "circle" : shape}
        {...props}
        {...(href ? { to: href } : {})}
      >
        {Icon ? <Icon size={18} className={children ? "-ml-1" : ""} /> : null}
        {children}
      </BaseButton>
    );
  }
);

export default Button;
