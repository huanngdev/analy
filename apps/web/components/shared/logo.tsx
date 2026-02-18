import Image from "next/image";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
};

export function Logo({ className, width = 100, height = 100 }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Analy logo"
      width={width}
      height={height}
      className={className}
    />
  );
}
