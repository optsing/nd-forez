import { AnalyzeInput, AnalyzeResult, GenLib, ParseResult, SizeStandard } from "../models/models";
import PyodideWorker from './python-worker.ts?worker';

const pyodide = new PyodideWorker();

let id = 0;
const callbacks = new Map<number, { resolve: (res: any) => void; reject: (err: any) => void; }>();

pyodide.addEventListener('message', e => {
    const { id, result, error } = e.data;
    const cb = callbacks.get(id);
    if (!cb) return;
    if (error) {
        cb.reject(error);
    } else {
        cb.resolve(result);
    }
    callbacks.delete(id);
})

export async function parseFiles(files: File[]): Promise<ParseResult> {
    const result: ParseResult = { id: null, size_standards: [], gen_libs: []}
    for (const file of files) {
        const content = await new Promise((resolve: (content: string) => void, reject) => {
            const fr = new FileReader();
            fr.onload = e => {
            const result = e.target?.result;
            if (result) {
                resolve(result as string);
            } else {
                reject();
            }
            };
            fr.readAsText(file);
        });
        const [size_standards, gen_libs] = await parseFile({ content, filename: file.name });
        result.size_standards.push(...size_standards);
        result.gen_libs.push(...gen_libs);
    }
    return result;
}

export async function parseFile(payload: { content: any, filename: string }): Promise<[SizeStandard[], GenLib[]]> {
    return new Promise((resolve, reject) => {
        const currentId = id++;
        callbacks.set(currentId, { resolve, reject });
        pyodide.postMessage({
            id: currentId,
            method: 'parse_file',
            payload,
        });
    });
}


export async function analyzeData(payload: AnalyzeInput): Promise<AnalyzeResult> {
    return new Promise((resolve, reject) => {
        const currentId = id++;
        callbacks.set(currentId, { resolve, reject });
        pyodide.postMessage({
            id: currentId,
            method: 'analyze',
            payload,
        });
    });
}
