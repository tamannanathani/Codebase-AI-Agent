import path from "path";

const normalizeImportPath = (
  importPath
) => {
  return path.basename(importPath);
};


export const extractImports = (content) => {
  const imports = [];
//this import regex will match import statements and capture the module path
const importRegex =
  /import[\s\S]*?from\s+["'](.*?)["']/g;

  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(normalizeImportPath(match[1]));
  }

  return imports;
};

export const extractExports = (content) => {
  const exports = [];

  const exportRegex = /export\s+default\s+(\w+)/g;

  let match;

  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  return exports;
};

//to parse http method and route path from router.<method>('<path>', ...) statements in the content of a file
export const extractRoutes = (content) => {
  const routes = [];

  //this regex captures match[1] as post and match[2] as /payroll if route is router.post("/payroll")
  const routeRegex =
    /router\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi;

  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({
      method: match[1].toUpperCase(),
      path: match[2],
    });
  }

  return routes;
};