import type { Locale } from "@/lib/i18n";
import type { CodeType } from "@/lib/qr/payloads";
import { toolsEn } from "./tools.en";
import { toolsFr } from "./tools.fr";
import type { ToolContent } from "./types";

export const TOOLS: Record<Locale, Record<CodeType, ToolContent>> = { en: toolsEn, fr: toolsFr };
