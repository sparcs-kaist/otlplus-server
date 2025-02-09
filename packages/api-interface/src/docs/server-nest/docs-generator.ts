import { ImportDeclaration, ModuleDeclaration, Project, SourceFile, VariableDeclarationKind } from 'ts-morph';
import { resolve } from 'path';
import * as fs from 'fs';

// 프로젝트 초기화
const project = new Project({
  skipFileDependencyResolution: true,
});

const outputDir = resolve(__dirname, './docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

project.addSourceFilesAtPaths(resolve(__dirname, '../../../../../apps/server/src/**/*.ts'));
const sourceFiles = project.getSourceFiles('/**/*.controller.ts');

function hasParameterDecorator(parameter: any, decoratorName: string) {
  return parameter
    .getDecorators()
    .some((decorator: { getName: () => string }) => decorator.getName() === decoratorName);
}

function isInterfaceImport(importPath: string, namedImports: string[]): boolean {
  return importPath.includes('interfaces') && namedImports.some((name) => name.startsWith('I'));
}

interface ApiEndpoint {
  name: string;
  method: 'post' | 'get' | 'put' | 'patch' | 'delete';
  requestParam: Record<string, string>;
  requestBody: Record<string, string>;
  requestQuery: Record<string, string>;
  responseBody: string;
  authRequired: boolean;
  apiPath: string;
}

interface ApiModule {
  domain: string;
  endpoints: ApiEndpoint[];
}

// ✅ 타입 변환 함수
function convertObjectToTypeString(obj: Record<string, string>): string {
  return Object.keys(obj).length > 0
    ? `{ ${Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join('; ')} }`
    : 'never';
}

// ✅ Controller별 파일 생성
function generateNamespace(namespace: ModuleDeclaration, apiEndpoints: ApiEndpoint[]) {

  apiEndpoints.forEach((apiEndpoint) => {
    const endpointNamespace = namespace.addModule({
      name: apiEndpoint.name,
      isExported: true,
    });

    // ✅ 런타임 값 추가 (const)
    endpointNamespace.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        { name: 'method', initializer: `'${apiEndpoint.method}'` },
        { name: 'apiPath', initializer: `'${apiEndpoint.apiPath}'` },
        { name: 'authRequired', initializer: `${apiEndpoint.authRequired}` },
      ],
    }).setIsExported(true);

    // ✅ 타입 추가 (type)
    endpointNamespace.addTypeAlias({
      name: 'RequestParam',
      type: convertObjectToTypeString(apiEndpoint.requestParam),
      isExported: true,
    });

    endpointNamespace.addTypeAlias({
      name: 'RequestBody',
      type: convertObjectToTypeString(apiEndpoint.requestBody),
      isExported: true,
    });

    endpointNamespace.addTypeAlias({
      name: 'RequestQuery',
      type: convertObjectToTypeString(apiEndpoint.requestQuery),
      isExported: true,
    });

    endpointNamespace.addTypeAlias({
      name: 'ResponseBody',
      type: apiEndpoint.responseBody || 'never',
      isExported: true,
    });
  });
}

const namedImportsRecord: Record<string, string[]> = {};

// ✅ 컨트롤러 분석 및 API 문서 생성
sourceFiles.forEach((sourceFile: SourceFile) => {

  // ✅ import 문 분석
  sourceFile.getImportDeclarations().forEach((importDeclaration: ImportDeclaration) => {
    const importPath = importDeclaration.getModuleSpecifierValue();
    const namedImports = importDeclaration.getNamedImports().map((namedImport) => namedImport.getName());
    if (isInterfaceImport(importPath, namedImports)) {
      if (!namedImportsRecord[importPath]) namedImportsRecord[importPath] = [];
      namedImportsRecord[importPath] = [...namedImportsRecord[importPath], ...namedImports];
    }
  });

  const classes = sourceFile.getClasses();

  // ✅ 컨트롤러별 API 네임스페이스 생성
  classes.forEach((classDeclaration) => {
    const controllerDecorator = classDeclaration.getDecorators().find((decorator) => decorator.getName() === 'Controller');
    if (!controllerDecorator) return;

    let apiBasePath = controllerDecorator.getArguments()[0]?.getText().slice(1, -1) ?? '';
    if (apiBasePath !== '') apiBasePath = '/' + apiBasePath;

    const apiModule: ApiModule = {
      domain: classDeclaration.getName()?.replace('Controller', '') ?? '',
      endpoints: [],
    };

    const filePath = `${outputDir}/${apiModule.domain}.ts`;
    const namespaceFile = project.createSourceFile(filePath, '', { overwrite: true });

    // ✅ import 문 생성
    const ImportStatements: Record<string, string> = {};
    Object.keys(namedImportsRecord).forEach((importPath) => {
      const namedImportsList = namedImportsRecord[importPath];
      namedImportsList.forEach((name) => {
        ImportStatements[name] = importPath;
      });
    });

    Object.keys(ImportStatements).forEach((name) => {
      namespaceFile.addImportDeclaration({
        moduleSpecifier: ImportStatements[name],
        namedImports: [{ name }],
      });
    })

    const namespace = namespaceFile.addModule({
      name: apiModule.domain,
      isExported: true,
    });
    classDeclaration.getMethods().forEach((method) => {
      const decorators = method.getDecorators();
      const httpMethodDecorator = decorators.find((decorator) => ['Post', 'Get', 'Put', 'Patch', 'Delete'].includes(decorator.getName()));
      if (!httpMethodDecorator) return;

      const methodType = httpMethodDecorator.getName().toLowerCase() as 'post' | 'get' | 'put' | 'patch' | 'delete';
      const apiResourcePath = httpMethodDecorator.getArguments()[0]?.getText().slice(1, -1) ?? '';
      const apiPath = apiBasePath + '/' + apiResourcePath;

      const requestBody: Record<string, string> = {};
      const requestParam: Record<string, string> = {};
      const requestQuery: Record<string, string> = {};
      const authRequired = !decorators.some((decorator) => decorator.getName() === 'Public');

      // ✅ 파라미터 분석
      method.getParameters().forEach((parameter) => {
        const paramName = parameter.getName();
        const paramType = parameter.getType()?.getText(parameter);

        if (hasParameterDecorator(parameter, 'Body')) {
          requestBody[paramName] = paramType;
        }
        if (hasParameterDecorator(parameter, 'Param')) {
          const requestParamName = parameter.getDecorators()[0].getArguments()[0].getText().slice(1, -1);
          requestParam[requestParamName] = paramType;
        }
        if (hasParameterDecorator(parameter, 'Query')) {
          requestQuery[paramName] = paramType;
        }
      });

      // ✅ 반환 타입 분석
      const responseBody = method.getReturnType().getTypeArguments()[0]?.getText(method);

      apiModule.endpoints.push({
        name: method.getName(),
        method: methodType,
        requestParam,
        requestBody,
        requestQuery,
        responseBody,
        authRequired,
        apiPath,
      });
    });

    generateNamespace(namespace, apiModule.endpoints);
    namespaceFile.saveSync();
  });
});

// ✅ server-nest/index.ts에 export 문 추가
const indexFile = project.createSourceFile(`${outputDir}/index.ts`, '', { overwrite: true });
fs.readdirSync(outputDir).forEach((file) => {
    if (file.endsWith('.ts') && file !== 'index.ts') {
      indexFile.addExportDeclaration({
        moduleSpecifier: `./${file.replace('.ts', '')}`,
      });
    }
  },
);
indexFile.saveSync();

// ✅ 파일 저장
project.save().then(() => console.log('Controllers successfully separated into files.'));