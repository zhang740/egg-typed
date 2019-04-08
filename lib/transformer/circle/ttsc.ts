'use strict';
import * as ts from 'typescript';
import { walker, isDecoratorNameInclude } from 'egg-controller/lib/transformer/util';

console.log('[egg-typed] load transformer: inject (circle).');

export default function transformer(_: ts.Program) {
  return {
    after(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        sourceFile.statements
          .filter(n => ts.isExpressionStatement(n) && ts.isCallExpression(n.expression))
          .forEach((node: ts.ExpressionStatement) => {
            const decExpr = <ts.CallExpression>node.expression;
            if (ts.isIdentifier(decExpr.expression) && decExpr.expression.text === '__decorate') {
              const arg = <ts.ArrayLiteralExpression>decExpr.arguments[0];
              if (
                arg.elements.filter(el => ts.isCallExpression(el)).some((el: ts.CallExpression) => {
                  return ts.isIdentifier(el.expression) && (
                    el.expression.text === 'inject' || el.expression.text === 'lazyInject'
                  );
                })
              ) {
                const metaExpr = <ts.CallExpression>arg.elements
                  .filter(el => ts.isCallExpression(el))
                  .find((el: ts.CallExpression) => {
                    const arg = el.arguments && el.arguments[0] as ts.Identifier;
                    return ts.isIdentifier(el.expression) &&
                      el.expression.text === '__metadata' &&
                      arg.text === 'design:type';
                  });
                if (metaExpr) {
                  const targetArg = metaExpr.arguments[1] as ts.Identifier;
                  metaExpr.arguments = ts.createNodeArray([
                    metaExpr.arguments[0],
                    ts.createFunctionExpression(
                      undefined,
                      undefined,
                      ts.createIdentifier(`${targetArg.escapedText}FC`),
                      undefined,
                      ts.createNodeArray([ts.createParameter(
                        undefined, undefined, undefined, ts.createIdentifier('ctx'),
                      )]),
                      undefined,
                      ts.createBlock([
                        ts.createReturn(
                          ts.createCall(
                            // 返回 Object.keys
                            ts.createPropertyAccess(
                              ts.createIdentifier('ctx'),
                              ts.createIdentifier('getComponent')
                            ),
                            undefined,
                            [targetArg],
                          )
                        ),
                      ])
                    )
                  ]);
                }
              }
            }
          });

        return walker(sourceFile, ctx);
      };
    },
  };
}
