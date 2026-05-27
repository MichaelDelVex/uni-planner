import { readFile } from "node:fs/promises";
import vm from "node:vm";

export async function loadBrowserModule(filePath, mocks, exportNames) {
  const source = await readFile(filePath, "utf8");
  const strippedImports = source
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];\s*/g, "")
    .replace(/import\s+["'][^"']+["'];\s*/g, "");

  const runnable = strippedImports
    .replace(/export\s+async\s+function\s+/g, "async function ")
    .replace(/export\s+function\s+/g, "function ")
    .replace(/export\s+const\s+/g, "const ")
    .replace(/export\s+let\s+/g, "let ")
    .replace(/export\s+var\s+/g, "var ");

  const context = vm.createContext({
    console,
    ...mocks
  });

  const exportedObject = `({${exportNames.map(name => `${name}: ${name}`).join(", ")}})`;
  const script = new vm.Script(`${runnable}\n${exportedObject};`, {
    filename: String(filePath)
  });

  return script.runInContext(context);
}

export function makeForm(values) {
  return {
    elements: {
      namedItem(name) {
        return { value: values[name] ?? "" };
      }
    }
  };
}
