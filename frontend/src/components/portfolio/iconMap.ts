import type { ComponentType } from "react";
import {
  Code2,
  Database,
  Gauge,
  Layers3,
  Mail,
  ShieldCheck,
  Wrench
} from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import {
  SiDjango,
  SiFastapi,
  SiGithub,
  SiLaravel,
  SiPhp,
  SiPython,
  SiReact,
  SiTypescript
} from "react-icons/si";

export type PortfolioIcon = ComponentType<{
  "aria-hidden"?: boolean | "true" | "false";
  size?: number | string;
}>;

export const portfolioIconMap: Record<string, PortfolioIcon> = {
  api: Gauge,
  code: Code2,
  database: Database,
  django: SiDjango,
  email: Mail,
  fastapi: SiFastapi,
  github: SiGithub,
  laravel: SiLaravel,
  layers: Layers3,
  linkedin: FaLinkedinIn,
  performance: Gauge,
  php: SiPhp,
  python: SiPython,
  react: SiReact,
  shield: ShieldCheck,
  typescript: SiTypescript,
  workflow: Wrench
};
