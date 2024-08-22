import { Decorator, Project, SyntaxKind } from 'ts-morph';

// 프로젝트 초기화
const project = new Project({
  tsConfigFilePath: '../../../tsconfig.json',
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
    .some(
      (decorator: { getName: () => string }) =>
        decorator.getName() === decoratorName,
    );
}

// 소스 파일 필터링 및 처리
sourceFiles.forEach((sourceFile) => {
  // 클래스 선언 찾기
  const classes = sourceFile.getClasses();

  classes.forEach((classDeclaration) => {
    // 클래스의 모든 메서드에 대해 처리
    classDeclaration.getMethods().forEach((method) => {
      // 메서드의 데코레이터 확인
      const decorators = method.getDecorators();
      if (!hasHttpMethodDecorator(decorators)) {
        return;
      }

      // 메서드의 파라미터 처리
      method.getParameters().forEach((parameter) => {
        if (hasParameterDecorator(parameter, 'Body')) {
          const paramType = parameter.getType().getText();
          method.addDecorator({
            name: 'ApiBody',
            arguments: [`{ type: ${paramType} }`],
          });
        }
        if (hasParameterDecorator(parameter, 'Param')) {
          const paramType = parameter.getType().getText();
          method.addDecorator({
            name: 'ApiParam',
            arguments: [`{ type: ${paramType} }`],
          });
        }
      });

      // 메서드의 반환 타입 가져오기
      const returnType = method.getReturnType().getText();
      method.addDecorator({
        name: 'ApiResponse',
        arguments: [
          `{ status: 201, description: 'The response', type: ${returnType} }`,
        ],
      });
    });
  });
});

// 변경 사항 저장
project.save().then(() => console.log('Decorators added successfully.'));
