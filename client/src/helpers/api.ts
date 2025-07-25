import { GenLibsAnalyzeInput, GenLibsAnalyzeOutput, ParseResult, ParseResultDescription, SizeStandardAnalyzeInput, SizeStandardAnalyzeOutput } from "../models/models";

export const API_URL = import.meta.env.VITE_API_URL;

export class APIError extends Error {
    status: number;
    detail: any;

    constructor(message: string, status: number, detail: any = null) {
        super(message);
        this.name = "APIError";
        this.status = status;
        this.detail = detail;
    }

    static async fromResponse(response: Response) {
        let parsed = null;
        try {
            parsed = await response.json();
        } catch {
            // ignore JSON parse errors
        }
        return new APIError(parsed?.detail || response.statusText, response.status, parsed)
    }
}

export function getErrorMessage(err: unknown) {
    return err instanceof Error ? err.message : 'Неизвестная ошибка';
}

export async function parseFiles(files: File[]): Promise<ParseResult> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await fetch(`${API_URL}api/parse-files`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw await APIError.fromResponse(response);
    }

    return await response.json();
}

export async function analyzeSizeStandard(input: SizeStandardAnalyzeInput): Promise<SizeStandardAnalyzeOutput> {
    const response = await fetch(`${API_URL}api/analyze-size-standards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw await APIError.fromResponse(response);
    }

    return await response.json();
}

export async function analyzeGenLibs(input: GenLibsAnalyzeInput): Promise<GenLibsAnalyzeOutput> {
    const response = await fetch(`${API_URL}api/analyze-gen-libs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw await APIError.fromResponse(response);
    }

    return await response.json();
}

export async function getParseResult(id: number): Promise<ParseResult> {
    const response = await fetch(`${API_URL}api/parse-results/${id}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw await APIError.fromResponse(response);
    }

    return await response.json();
}

export async function getParseResults(): Promise<ParseResultDescription[]> {
    const response = await fetch(`${API_URL}api/parse-results`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw await APIError.fromResponse(response);
    }

    return await response.json();
}
