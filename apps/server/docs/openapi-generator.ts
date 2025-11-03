import 'tsconfig-paths/register'
import { targetConstructorToSchema } from 'class-validator-jsonschema'
import fs from 'fs'
import {
  OpenAPIObject, OperationObject, PathItemObject, SchemaObject,
} from 'openapi3-ts/oas31'
import path from 'path'
import { createGenerator, SchemaGenerator } from 'ts-json-schema-generator'
import {
  Decorator, Project, SourceFile, SyntaxKind,
} from 'ts-morph'

/** 간단 path normalize */
function normalizePath(p: string) {
  return p.replace(/\/+/g, '/').replace(/\/$/, '')
}

const HTTP_METHOD_DECORATORS = ['Get', 'Post', 'Put', 'Delete', 'Patch']
const EXCLUDE_FILES = ['IAuth.ts', 'index.ts', 'validators.decorator.ts']
const EXCLUDE_DIRS = ['volumes']

function hasPublicDecorator(decorators: Decorator[]): boolean {
  return decorators.some((dec) => dec.getName() === 'Public')
}

function isExcludedPath(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/')
  return EXCLUDE_DIRS.some((dir) => {
    const dirPattern = `/${dir}/`
    return normalizedPath.includes(dirPattern) || normalizedPath.endsWith(`/${dir}`)
  })
}

function convertTypeArrayToOneOf(obj: any) {
  if (typeof obj !== 'object' || obj === null) return

  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      convertTypeArrayToOneOf(value)
    }

    // type: ['string', 'null'] => oneOf
    if (key === 'type' && Array.isArray(value)) {
      const oneOf = value.map((t) => ({ type: t }))
      // eslint-disable-next-line no-param-reassign
      delete obj.type
      // eslint-disable-next-line no-param-reassign
      obj.oneOf = oneOf
    }
  }
}

function createFullSchemaGenerator(tsConfigPath: string, sourceFile: string): SchemaGenerator {
  const config = {
    path: sourceFile, // 혹은 특정 파일 경로
    tsconfig: tsConfigPath,
    type: '*', // 모든 타입
  }
  // createProgram, createParser, createFormatter
  // const program = createProgram(config)
  // const parser = createParser(program, config)
  // const formatter = createFormatter(config)
  return createGenerator(config)
}

function getNamespaceChain(node: { getFirstAncestorByKind: (arg0: SyntaxKind) => any }) {
  const chain: string[] = []
  let current = node.getFirstAncestorByKind(SyntaxKind.ModuleDeclaration)
  while (current) {
    chain.unshift(current.getName()) // 바깥 → 안쪽 순
    current = current.getFirstAncestorByKind(SyntaxKind.ModuleDeclaration)
  }
  return chain
}
function replaceRefs(obj: any) {
  if (typeof obj !== 'object' || obj === null) return

  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'object') {
      replaceRefs(value)
    }
    else if (key === '$ref' && typeof value === 'string') {
      if (value.startsWith('#/definitions/')) {
        // eslint-disable-next-line no-param-reassign
        obj[key] = value.replace('#/definitions/', '#/components/schemas/')
      }
    }
  }
}

async function main() {
  const tsConfigPath = './apps/server/tsconfig.app.json' // 실제 경로 설정
  const project = new Project({
    tsConfigFilePath: tsConfigPath,
    skipFileDependencyResolution: true,
    skipAddingFilesFromTsConfig: false,
    useInMemoryFileSystem: false,
  })
  const openapiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: {
      title: 'OTL Server',
      version: '1.0.0',
      description: 'OTL PLUS main Server의 Swagger 문서입니다.',
    },
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        jwtCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
        sidCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'AUTH-SID',
        },
        jwtHeaderAccessToken: {
          type: 'http',
          scheme: 'bearer',
          name: 'accessToken',
        },
        jwtHeaderRefreshToken: {
          type: 'http',
          scheme: 'bearer',
          name: 'X-REFRESH-TOKEN',
        },
        sidHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-AUTH-SID',
        },
      },
    },
    security: [
      {
        jwtCookie: [],
        sidCookie: [],
        jwtHeaderAccessToken: [],
        jwtHeaderRefreshToken: [],
        sidHeader: [],
      },
    ],
  }

  // const schemaInterfacesPaths = []
  // const schemaTypeAliasPaths = []
  const classValidatorSchemas: Record<string, any> = {}
  const interfacesSchema: Record<string, any> = {}
  const schemaSourceFiles = project
    .getSourceFiles('apps/server/src/common/interfaces/**/*.ts')
    .filter((sourceFile) => !isExcludedPath(sourceFile.getFilePath()))
  for (const sourceFile of schemaSourceFiles) {
    const modules = sourceFile.getModules()
    // const interfaces = modules.flatMap((m) => m.getInterfaces())
    // const interfacesPaths = interfaces.map((i) => i.getSourceFile().getFilePath())
    // schemaInterfacesPaths.push(...interfacesPaths)
    // const types = modules.flatMap((m) => m.getTypeAliases())
    // const typesPaths = types.map((i) => i.getSourceFile().getFilePath())
    // schemaTypeAliasPaths.push(...typesPaths)
    const filePath = sourceFile.getFilePath()
    if (EXCLUDE_FILES.some((f) => filePath.includes(f))) continue
    const schemaGenerator = createFullSchemaGenerator(tsConfigPath, filePath)
    const allInterfaceSchema = schemaGenerator.createSchema('*')
    const { definitions } = allInterfaceSchema
    if (definitions && typeof definitions === 'object') {
      for (const [typeName, schema] of Object.entries(definitions)) {
        // 중복되면 덮어쓸 수도 있고, 필요하면 이름 충돌 처리를 해야 함
        // console.log(typeName, schema)
        interfacesSchema[typeName] = schema
      }
    }
    const classes = modules.flatMap((m) => m.getClasses())
    const mod = await import(filePath)
    for (const classDec of classes) {
      const className = classDec.getName()
      if (!className) continue
      const nsChain = getNamespaceChain(classDec)
      let ctx: any = mod
      for (const ns of nsChain) ctx = ctx?.[ns]
      const ctor = ctx?.[className]

      if (!ctor) continue // 여전히 못 찾으면 skip
      const schemaKey = [...nsChain, className].join('.')
      // console.log(schemaKey)
      classValidatorSchemas[schemaKey] = targetConstructorToSchema(ctor)
    }
  }

  // console.log('interfaces schema', interfacesSchema)
  // console.log('class-validator schemas', classValidatorSchemas)

  const sourceFiles = project
    .getSourceFiles('apps/server/src/**/*.controller.ts')
    .filter((sourceFile) => !isExcludedPath(sourceFile.getFilePath()))
  sourceFiles.forEach((sourceFile: SourceFile) => {
    const classes = sourceFile.getClasses()
    for (const cls of classes) {
      const controllerDeco = cls.getDecorators().find((d) => d.getName() === 'Controller')
      if (!controllerDeco) continue
      const controllerArg = controllerDeco.getCallExpression()?.getArguments()[0]
      let basePath = ''
      if (controllerArg && controllerArg.getKind() === SyntaxKind.StringLiteral) {
        basePath = (controllerArg as any).getLiteralValue()
      }

      // 메서드 순회
      for (const method of cls.getMethods()) {
        const routeDecorator = method.getDecorators().find((d) => HTTP_METHOD_DECORATORS.includes(d.getName()))
        if (!routeDecorator) continue

        // path
        const routeArg = routeDecorator.getCallExpression()?.getArguments()[0]
        let routePath = ''
        if (routeArg && routeArg.getKind() === SyntaxKind.StringLiteral) {
          routePath = (routeArg as any).getLiteralValue()
        }
        let fullPath = normalizePath(`/${basePath}/${routePath}`)
        fullPath = fullPath === '' ? '/' : fullPath
        fullPath = fullPath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}')

        // Security: @Public()?
        const isPublic = hasPublicDecorator(method.getDecorators())

        // 파라미터들
        const parameters: any[] = []
        const bodyParams: any[] = []
        // console.log(method.getParameters())
        method.getParameters().forEach((param) => {
          const deco = param.getDecorators()[0]

          if (!deco) return
          const dName = deco.getName().toLowerCase() // query, body, param

          // === GetLanguage decorator detection ===
          // NOTE: We check by decorator name directly ("GetLanguage").
          // Also, ignore the normal process below and just inject header param.
          if (deco.getName() === 'GetLanguage') {
            // Inject accept-language header parameter if not already pushed
            parameters.push({
              name: 'accept-language',
              in: 'header',
              required: false,
              schema: { type: 'string', enum: ['en', 'ko'] },
              description: 'en/ko (기본: ko). 언어 헤더 파라미터',
            })
            return
          }
          if (!['query', 'param', 'body'].includes(dName)) {
            return
          }
          // 여기서는 어떤 타입인지 이름만 추출 (실제로는 $ref 달아야 함)
          // paramType => class or interface
          const paramType = param.getType()
          const paramTypeName = paramType.getText(param) // 단순히 텍스트로 보는 예시
          if (dName === 'body') {
            bodyParams.push({
              name: param.getName(),
              schemaRef: paramTypeName, // 실제는 $ref를 찾는 로직 필요
              required: !param.isOptional(),
            })
          }
          else if (dName === 'param') {
            parameters.push({
              name: param.getName(),
              in: 'path', // query, param
              required: !param.isOptional(),
              schema: {
                type: 'string',
              },
            })
          }
          else {
            let schemaObject = {}
            if (!paramType.isClassOrInterface() || !paramType.isObject()) {
              schemaObject = {
                ...schemaObject,
                type: paramType.getText(),
              }
            }
            else {
              schemaObject = {
                ...schemaObject,
                $ref: `#/components/schemas/${paramTypeName}`,
              }
            }
            parameters.push({
              name: param.getName(),
              in: dName, // query, param
              required: !param.isOptional(),
              schema: schemaObject,
            })
          }
        })
        // 반환타입 (Promise<Something> -> Something)
        let returnType = method.getReturnType()
        if (returnType.getTypeArguments()) {
          // eslint-disable-next-line prefer-destructuring
          returnType = returnType.getTypeArguments()[0]
        }
        const returnTypeName = returnType?.getText(method)
        // OpenAPI Operation
        const httpMethod = routeDecorator.getName().toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch'

        let schemaObject = {}
        if (
          !returnType
          || returnType.isVoid()
          || returnType.isNever()
          || returnType.isNull()
          || returnType.isUndefined()
        ) {
          schemaObject = {
            type: 'null',
          }
        }
        else if (returnType.isAny()) {
          schemaObject = {
            type: 'object',
          }
        }
        else if (returnType.isString()) {
          schemaObject = { type: 'string' }
        }
        else if (returnType.isNumber()) {
          schemaObject = { type: 'number' }
        }
        else if (returnType.isBoolean()) {
          schemaObject = { type: 'boolean' }
        }
        else if (returnType.isUnion()) {
          const unionTypes = returnType.getUnionTypes()
          const typeSchemas = unionTypes.map((type) => {
            if (!type || type.isUndefined() || type.isVoid() || type.isNever() || type.isNull()) {
              return {
                type: 'null',
              }
            }
            if (type.isAny()) {
              return {
                type: 'object',
              }
            }
            if (type.isArray()) {
              let currentType = type
              let depth = 0

              // 1. 배열 중첩 깊이 확인
              while (currentType.isArray()) {
                currentType = currentType.getArrayElementTypeOrThrow()
                depth += 1
              }

              const typeName = currentType.getText(method)
              // typeName = typeName.replace(/^import\(".*?"\)\./, '') // import 제거

              let itemsSchema: any = {
                $ref: `#/components/schemas/${typeName}`,
              }
              // eslint-disable-next-line no-plusplus
              for (let i = 0; i < depth; i++) {
                itemsSchema = {
                  type: 'array',
                  items: itemsSchema,
                }
              }
              return itemsSchema
            }
            if (type.isClassOrInterface()) {
              return {
                $ref: `#/components/schemas/${type.getText(method)}`,
              }
            }
            return {
              type: type.getText(),
            }
          })
          schemaObject = {
            oneOf: typeSchemas,
          }
        }
        else if (returnType.isArray()) {
          let currentType = returnType
          let depth = 0

          // 1. 배열 중첩 깊이 확인
          while (currentType.isArray()) {
            currentType = currentType.getArrayElementTypeOrThrow()
            depth += 1
          }

          const typeName = currentType.getText(method)
          // typeName = typeName.replace(/^import\(".*?"\)\./, '') // import 제거

          let itemsSchema: any = {
            $ref: `#/components/schemas/${typeName}`,
          }
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < depth; i++) {
            itemsSchema = {
              type: 'array',
              items: itemsSchema,
            }
          }

          schemaObject = itemsSchema
        }
        else if (returnType.isObject() && !returnType.isClassOrInterface()) {
          const props = returnType.getProperties()
          const properties: Record<string, any> = {}
          const required: string[] = []

          for (const prop of props) {
            const propName = prop.getName()
            const declarations = prop.getDeclarations()
            const declaration = declarations[0]
            const propType = prop.getTypeAtLocation(declaration)
            const typeText = propType.getText(method)

            // 기본 타입 분기
            if (propType.isString()) {
              properties[propName] = { type: 'string' }
            }
            else if (propType.isNumber()) {
              properties[propName] = { type: 'number' }
            }
            else if (propType.isBoolean()) {
              properties[propName] = { type: 'boolean' }
            }
            else if (propType.isArray()) {
              const elemType = propType.getArrayElementTypeOrThrow()
              const elemTypeText = elemType.getText(method)
              if (elemType.isString() || elemType.isNumber() || elemType.isBoolean()) {
                properties[propName] = {
                  type: 'array',
                  items: { type: elemType.getText(method) },
                }
              }
              else {
                properties[propName] = {
                  type: 'array',
                  items: { $ref: `#/components/schemas/${elemTypeText}` },
                }
              }
            }
            else if (propType.isClassOrInterface()) {
              const refName = typeText.replace(/^import\(".*?"\)\./, '')
              properties[propName] = { $ref: `#/components/schemas/${refName}` }
            }
            else {
              properties[propName] = { type: 'string' }
            }

            required.push(propName)
          }

          schemaObject = {
            type: 'object',
            properties,
            required,
          }
        }
        else if (!returnType.isClassOrInterface()) {
          schemaObject = {
            ...schemaObject,
            type: returnType.getText(),
          }
        }
        else {
          schemaObject = {
            ...schemaObject,
            $ref: `#/components/schemas/${returnTypeName}`,
          }
        }

        const operation: OperationObject = {
          summary: `${cls.getName()}.${method.getName()}`,
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  // 여기서 $ref 삽입
                  schema: schemaObject,
                },
              },
            },
          },
        }
        if (isPublic) {
          operation.security = []
        }

        // Query/Param을 parameters로
        if (parameters.length > 0) {
          operation.parameters = parameters
        }

        // Body는 requestBody로
        if (bodyParams.length > 0) {
          // 단순히 첫 번째 Body만 쓰는 예시
          const bp = bodyParams[0]
          operation.requestBody = {
            required: bp.required,
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${bp.schemaRef}`,
                },
              },
            },
          }
        }
        if (openapiDoc.paths) {
          if (!openapiDoc.paths[fullPath]) {
            openapiDoc.paths[fullPath] = {} as PathItemObject
          }
          (openapiDoc.paths[fullPath] as PathItemObject)[httpMethod] = operation
        }
      }
    }
  })
  // 4.1 ts-json-schema-generator 결과 병합
  //   allInterfaceSchema.definitions (혹은 $defs)에 실제 인터페이스별 스키마가 들어있음
  for (const [typeName, schema] of Object.entries(interfacesSchema)) {
    openapiDoc.components!.schemas![typeName] = schema as SchemaObject
  }

  // 4.2 class-validator-jsonschema 결과 병합
  //   { 클래스이름: JSONSchema } 형태이므로, 그대로 넣어주면 됨
  for (const [className, jsonSchema] of Object.entries(classValidatorSchemas)) {
    openapiDoc.components!.schemas![className] = jsonSchema as SchemaObject
  }
  // const enumPath = './libs/common/tsconfig.lib.json' // 실제 경로 설정
  // const libsProject = new Project({
  //   tsConfigFilePath: enumPath,
  // })

  // const enumSchemas: Record<string, { type: 'string', enum: string[] }> = {}
  // const enumSourceFiles = libsProject.getSourceFiles('libs/common/src/enum/**/*.ts')
  // enumSourceFiles.forEach((sourceFile) => {
  //   const variableStatements = sourceFile.getVariableStatements()
  //
  //   variableStatements.forEach((varStmt) => {
  //     const declarations = varStmt.getDeclarations()
  //
  //     declarations.forEach((decl) => {
  //       const initializer = decl.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)
  //
  //       if (
  //         initializer
  //         && initializer.getKind() === SyntaxKind.ObjectLiteralExpression
  //       ) {
  //         const typeNode = decl.getTypeNode()
  //         console.log(typeNode)
  //
  //         if (
  //           typeNode
  //           && typeNode.getText().includes('Union')
  //           && typeNode.getText().includes('typeof')
  //         ) {
  //           const enumName = decl.getName()
  //           const properties = initializer.getProperties()
  //
  //           const enumMembers = properties.map((prop) => {
  //             if (prop.getKind() === SyntaxKind.PropertyAssignment) {
  //               console.log(prop)
  //               return { prop }
  //             }
  //             return null
  //           }).filter(Boolean)
  //           enumSchemas[enumName] = {
  //             type: 'string',
  //             enum: 'sss',
  //           }
  //         }
  //       }
  //     })
  //   })
  // })

  // console.log(enumSchemas)
  replaceRefs(openapiDoc)
  convertTypeArrayToOneOf(openapiDoc)
  // 8) 최종 결과물 출력 (swagger.json)
  const outFileInSrc = path.join(process.cwd(), 'apps/server/src', 'swagger.json')
  const outFileInDocs = path.join(process.cwd(), 'apps/server/docs', 'swagger.json')
  fs.writeFileSync(outFileInSrc, JSON.stringify(openapiDoc, null, 2), 'utf-8')
  fs.writeFileSync(outFileInDocs, JSON.stringify(openapiDoc, null, 2), 'utf-8')
  console.log(`Swagger JSON generated at: ${outFileInSrc}`)
  console.log(`Swagger JSON generated at: ${outFileInDocs}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
