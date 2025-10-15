// import { loadPyodide, PyodideInterface } from 'pyodide';


// async function initPyodide(): Promise<PyodideInterface> {
//     const pyodide = await loadPyodide({
//         indexURL: '/assets/pyodide',
//     });
//     await pyodide.loadPackage(['numpy', 'scipy', 'pywavelets', 'pydantic']);
//     const response = await fetch('/assets/pyodide/code.zip');
//     const buffer = await response.arrayBuffer();
//     pyodide.unpackArchive(buffer, 'zip');
//     return pyodide;
// }


// let pyodidePromise: Promise<PyodideInterface> | null = null;
// function lazyPyodide(): Promise<PyodideInterface> {
//     if (!pyodidePromise) {
//         pyodidePromise = initPyodide();
//     }
//     return pyodidePromise;
// }

// self.onmessage = async (event) => {
//     const pyodide = await lazyPyodide();

//     const { id, method, payload } = event.data;

//     if (method === 'parse_file') {
//         pyodide.globals.set('content', payload.content);
//         pyodide.globals.set('filename', payload.filename);
//         const result = await pyodide.runPythonAsync(`
//             import json
//             from lib.parsing import parse_file

//             size_standards, gen_libs = parse_file(content, filename)

//             result_s = []
//             result_g = []
//             for s in size_standards:
//                 result_s.append(s.model_dump())
//             for g in gen_libs:
//                 result_g.append(g.model_dump())
//             json.dumps([result_s, result_g])
//         `)
//         console.log(result)
//         self.postMessage({ id, result: JSON.parse(result) });
//     } else if (method === 'analyze') {
//         pyodide.globals.set('json_string', JSON.stringify(payload));
//         const result = await pyodide.runPythonAsync(`
//             import json
//             from models.models import SizeStandard, GenLib
//             from lib.analyzis import analyze

//             data = json.loads(json_string)
//             size_standard = SizeStandard(**data['size_standard'])
//             gen_libs = []
//             for g in data['gen_libs']:
//                 gen_libs.append(GenLib(**g))

//             result = analyze(size_standard, gen_libs)

//             result.model_dump_json()
//         `)
//         self.postMessage({ id, result: JSON.parse(result) });
//     }
// };
