import { Decorator, ImportDeclaration, Project, SourceFile } from 'ts-morph';

// 프로젝트 초기화
const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

const outputFile = project.createSourceFile('src/common/api-docs/types.ts', '', {
  overwrite: true,
});

const sourceFiles = project.getSourceFiles('src/**/*.controller.ts');

// 특정 데코레이터를 찾는 헬퍼 함수
function hasHttpMethodDecorator(decorators: Decorator[]) {
  const httpMethods = ['Post', 'Get', 'Put', 'Patch', 'Delete'];
  return decorators.some((decorator) => {
    const name = decorator.getName();
    return httpMethods.includes(name);
  });
}

// 파라미터의 데코레이터를 확인하는 헬퍼 함수
function hasParameterDecorator(parameter: any, decoratorName: string) {
  return parameter
    .getDecorators()
    .some((decorator: { getName: () => string }) => decorator.getName() === decoratorName);
}

// 인터페이스와 관련된 import 문인지 확인하는 함수
function isInterfaceImport(importPath: string, namedImports: string[]): boolean {
  // import 경로에 'interfaces'가 포함되어 있거나, named import 중 'I'로 시작하는 것이 있는지 확인
  return importPath.includes('interfaces') && namedImports.some((name) => name.startsWith('I'));
}

interface apiEndpoint {
  [key: string]: any;
}

function generateNamespace(apiName: string, apiEndpoint: apiEndpoint) {
  // Add namespace for each method
  const namespace = outputFile.addModule({
    name: apiName,
    isExported: true,
  });

  Object.keys(apiEndpoint).forEach((key) => {
    namespace.addTypeAlias({
      name: key,
      type: apiEndpoint[key] ?? 'never',
      isExported: true,
    });
  });
}

const namedImportsLst: Set<string> = new Set();

// 소스 파일 필터링 및 처리
sourceFiles.forEach((sourceFile: SourceFile) => {
  // 인터페이스 관련 import 문 복사
  sourceFile.getImportDeclarations().forEach((importDeclaration: ImportDeclaration) => {
    const importPath = importDeclaration.getModuleSpecifierValue();
    const namedImports = importDeclaration.getNamedImports().map((namedImport) => namedImport.getName());
    if (isInterfaceImport(importPath, namedImports)) {
      namedImports.forEach((name) => {
        namedImportsLst.add(name);
      });
    }
  });

  const classes = sourceFile.getClasses();

  //  클래스의 메쏘드에 대해서 파라미터와 반환 타입을 추출한 뒤, 네임 스페이스 생성.
  classes.forEach((classDeclaration) => {
    classDeclaration.getMethods().forEach((method) => {
      const decorators = method.getDecorators();
      if (!hasHttpMethodDecorator(decorators)) {
        return;
      }
      let requestBody, requestParam, responseBody, requestQuery;

      // 메서드의 파라미터 처리
      method.getParameters().forEach((parameter) => {
        if (hasParameterDecorator(parameter, 'Body')) {
          requestBody = parameter.getType()?.getText(parameter); //undefined, TypeFormatFlags);
        }
        if (hasParameterDecorator(parameter, 'Param')) {
          requestParam = parameter.getType()?.getText(parameter);
        }
        if (hasParameterDecorator(parameter, 'Query')) {
          requestQuery = parameter.getType()?.getText(parameter);
        }
      });

      // 메서드의 반환 타입 가져오기
      responseBody = method.getReturnType();
      // Promise 로 감싸져 있는 경우, 타입 argument만 추출
      if (responseBody.getTypeArguments()) {
        responseBody = responseBody.getTypeArguments()[0];
      }
      responseBody = responseBody?.getText(method);

      generateNamespace(method.getName(), {
        requestParam,
        requestBody,
        requestQuery,
        responseBody,
      });
    });
  });
});

outputFile.addImportDeclaration({
  moduleSpecifier: 'src/common/interfaces',
  namedImports: [...namedImportsLst].map((name) => ({ name })),
});

// 변경 사항 저장
project.save().then(() => console.log('Decorators added successfully.'));
