import { GenLibAnalyzeError, GenLibAnalyzeResult, GenLibParseResult, SizeStandardAnalyzeError, SizeStandardAnalyzeResult, SizeStandardParseResult } from "./models";

export interface SizeStandardComplete {
    parsed: SizeStandardParseResult;
    analyzed: SizeStandardAnalyzeResult | SizeStandardAnalyzeError | null;
    analyzedGenLibs: Map<number, GenLibAnalyzeResult | GenLibAnalyzeError>;
}

export type AnalyzeState = {
    state: 'error',
    message: string;
} | {
    state: 'success';
} | null;
