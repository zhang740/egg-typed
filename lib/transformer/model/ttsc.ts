import * as ts from 'typescript';
import { walker, isDecoratorNameInclude } from 'egg-controller/lib/transformer/util';

console.log('[egg-typed] load transformer: orm model.');

export default function transformer(_: ts.Program) {
  const typeChecker = _.getTypeChecker();
  return {
    before(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        // 遍历文件中所有的 class
        sourceFile.statements
          .filter(n => ts.isClassDeclaration(n) && isDecoratorNameInclude(n, 'model'))
          .forEach((node: ts.ClassDeclaration) => {
            const decorator = node.decorators.find(dec => {
              return (dec.expression as any).expression.escapedText === 'model';
            });
            let expression = decorator.expression as ts.CallExpression;
            if (!expression.arguments.length) {
              expression = decorator.expression = ts.updateCall(expression, expression.expression, undefined, [
                ts.createObjectLiteral([], false)
              ]);
            }
            // @model 配置参数
            const config = expression.arguments[0];
            if (!ts.isObjectLiteralExpression(config)) {
              console.warn('[egg-typed]orm transformer:', `@model of class [${node.name.escapedText}] param is not a ObjectLiteral.`);
              return;
            }
            let columnField = getDecoratorField(config, 'columns');
            let referenceField = getDecoratorField(config, 'references');

            node.members.forEach(member => {
              if (
                !ts.isPropertyDeclaration(member)
                || !ts.isIdentifier(member.name)
                || ts.isFunctionLike(member.type)
              ) {
                return;
              }

              const typeIdentifier = getTypeIdentifier(member.type, sourceFile, typeChecker);
              if (
                isDecoratorNameInclude(member, 'reference') ||
                (typeIdentifier.typeRef && !isDecoratorNameInclude(member, 'column'))
              ) {
                referenceField.properties = ts.createNodeArray([
                  ...referenceField.properties,
                  ts.createPropertyAssignment(
                    `${member.name.escapedText}`,
                    ts.createObjectLiteral([
                      ts.createPropertyAssignment(
                        'model', typeIdentifier.identifier
                      ),
                      typeIdentifier.array && ts.createPropertyAssignment('toMany', ts.createTrue()),
                      typeIdentifier.promise && ts.createPropertyAssignment('lazy', ts.createTrue()),
                    ].filter(p => p))
                  )
                ]);
              } else {
                columnField.properties = ts.createNodeArray([
                  ...columnField.properties,
                  ts.createPropertyAssignment(
                    `${member.name.escapedText}`,
                    ts.createObjectLiteral([
                      ts.createPropertyAssignment('type', typeIdentifier.identifier),
                    ])
                  )
                ]);
              }
            });
          });

        return walker(sourceFile, ctx);
      };
    },
  };
}

function getDecoratorField(config: ts.ObjectLiteralExpression, fieldName: string) {
  let field: ts.ObjectLiteralExpression;
  field = config.properties.find(p => {
    return ts.isIdentifier(p.name) && p.name.escapedText === fieldName;
  }) as any;
  if (!field) {
    field = ts.createObjectLiteral();
    config.properties = ts.createNodeArray([
      ...config.properties,
      ts.createPropertyAssignment(fieldName, field),
    ]);
  } else {
    field = (field as any).initializer;
  }
  return field;
}

function getTypeIdentifier(typeNode: ts.TypeNode, sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): {
  identifier: ts.Identifier, promise?: boolean, array?: boolean, typeRef?: boolean,
} {
  const type = typeChecker.getTypeFromTypeNode(typeNode);

  if (
    type.flags & ts.TypeFlags.String ||
    type.flags & ts.TypeFlags.StringLike ||
    type.flags & ts.TypeFlags.Enum ||
    type.flags & ts.TypeFlags.EnumLike
  ) {
    return { identifier: ts.createIdentifier('String') };
  } else if (
    type.flags & ts.TypeFlags.Number ||
    type.flags & ts.TypeFlags.NumberLike
  ) {
    return { identifier: ts.createIdentifier('Number') };
  } else if (
    type.flags & ts.TypeFlags.Boolean ||
    type.flags & ts.TypeFlags.BooleanLike
  ) {
    return { identifier: ts.createIdentifier('Boolean') };
  } else if (
    type.flags & ts.TypeFlags.Any
  ) {
    return { identifier: ts.createIdentifier('Object') };
  } else if (type.flags & ts.TypeFlags.Object) {
    const objType = type as ts.ObjectType;

    if (
      objType.objectFlags & ts.ObjectFlags.Interface ||
      objType.objectFlags & ts.ObjectFlags.Anonymous
    ) {
      return { identifier: ts.createIdentifier('Object') };
    }

    switch (typeNode.kind) {
      case ts.SyntaxKind.ArrayType:
        const arrayNode = typeNode as ts.ArrayTypeNode;
        return {
          ...getTypeIdentifier(arrayNode.elementType, sourceFile, typeChecker),
          array: true,
        };

      case ts.SyntaxKind.TypeLiteral:
        // mapper json
        return { identifier: ts.createIdentifier('Object') };

      case ts.SyntaxKind.TypeReference:
        const typeRefNode = typeNode as ts.TypeReferenceNode;
        const result = {
          identifier: typeRefNode.typeName as any,
          typeRef: true,
        };

        switch ((typeRefNode.typeName as ts.Identifier).escapedText) {
          case 'Array':
            return {
              ...result,
              ...getTypeIdentifier(typeRefNode.typeArguments[0], sourceFile, typeChecker),
              array: true,
            };
          case 'Promise':
            return {
              ...result,
              ...getTypeIdentifier(typeRefNode.typeArguments[0], sourceFile, typeChecker),
              promise: true,
            };
        }

        sourceFile.statements
          .filter(n => ts.isImportDeclaration(n))
          .forEach((im: ts.ImportDeclaration) => {
            const nb = im.importClause.namedBindings as ts.NamedImports;
            const el = nb.elements.find(el => {
              return el.name.escapedText === (typeRefNode.typeName as ts.Identifier).escapedText;
            });
            if (el) {
              result.identifier = el.name;
              im.flags = im.flags | ts.NodeFlags.Synthesized;
            }
          });
        return result;
    }
  }
  return { identifier: ts.createIdentifier('Object') };
}
