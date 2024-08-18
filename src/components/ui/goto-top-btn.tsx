import { useEffect, useRef, useState } from "react";
import Button from "./button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const GotoTopButton = () => {
  const mainElRef = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;

    mainElRef.current = mainEl;

    const onScroll = () => {
      if (mainEl.scrollTop > 300) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    mainEl.addEventListener("scroll", onScroll);
    return () => mainEl.removeEventListener("scroll", onScroll);
  }, []);

  const onClick = () => {
    const mainEl = mainElRef.current;
    if (!mainEl) return;

    mainEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      icon={ArrowUp}
      className={cn(
        "fixed bottom-4 right-4 invisible opacity-0 transition-opacity",
        show && "visible opacity-100"
      )}
      onClick={onClick}
    >
      Top
    </Button>
  );
};

export default GotoTopButton;
