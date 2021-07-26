import { CallExpression, Project, SyntaxKind } from 'ts-morph';
import { extractConfig } from './config.js';
import { postProcess } from './postprocess.js';

export function transformString(inputText: string): string {
  const { unwrapFunctionCall, unwrapParamerizedType, renameVariable, renameType } = extractConfig(inputText);

  const project = new Project({
    useInMemoryFileSystem: true,
  });
  const inputFile = project.createSourceFile(
    'async.ts', inputText);

  inputFile
    .getFunctions()
    .forEach((func) => {
      if (func.isAsync()) {
        func.setIsAsync(false);
      }
    });

  inputFile
    .getDescendantsOfKind(SyntaxKind.ArrowFunction)
    .forEach((arrowFunc) => {
      if (arrowFunc.isAsync()) {
        arrowFunc.setIsAsync(false);
      }
    });
  
  inputFile
    .getDescendantsOfKind(SyntaxKind.FunctionExpression)
    .forEach((funcExpr) => {
      if (funcExpr.isAsync()) {
        funcExpr.setIsAsync(false);
      }
    });
  
  inputFile
    .getDescendantsOfKind(SyntaxKind.ForOfStatement)
    .forEach((forOfStatement) => {
      if (forOfStatement.isAwaited()) {
        forOfStatement.setIsAwaited(false);
      }
    });

  inputFile
    .getDescendantsOfKind(SyntaxKind.AwaitExpression)
    .forEach((awaitExpression) => {
      const operandText = awaitExpression.getChildAtIndex(1).getText();
      awaitExpression.replaceWithText(operandText);
    });

  // renameVariable
  inputFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .forEach((identifier) => {
      const identifierName = identifier.getText();
      const replacement = renameVariable.get(identifierName);
      if (replacement) {
        identifier.replaceWithText(replacement);
      }
    });

  // renameType
  inputFile
    .getDescendantsOfKind(SyntaxKind.TypeReference)
    .forEach((typeRef) => {
      const typeName = typeRef.getTypeName().getText();
      const typeReplacement = renameType.get(typeName);
      if (typeReplacement) {
        typeRef.getTypeName().replaceWithText(typeReplacement);
      }
    });

  // unwrapParamerizedType
  inputFile
    .getDescendantsOfKind(SyntaxKind.TypeReference)
    .forEach((typeRef) => {
      if (typeRef.wasForgotten())
        return;
      const typeName = typeRef.getTypeName().getText();
      if (unwrapParamerizedType.has(typeName)) {
        if (typeRef.getTypeArguments().length !== 1) {
          throw new Error(`Type ${typeRef.getText()} must have exactly 1 type argument`);
        }
        const text = typeRef.getTypeArguments()[0].getText();
        typeRef.replaceWithText(text);
      }
    });

  // unwrapFunctionCall
  while (true) {
    let thereWereReplacements = false;
    inputFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .forEach((callExpr) => {
        if (callExpr.wasForgotten())
          return;
        if (unwrapFunctionCall.has(getFunctionName(callExpr))) {
          if (callExpr.getArguments().length !== 1) {
            throw new Error(`Function call ${callExpr.getText()} must have exactly 1 argument`);
          }
          const text = callExpr.getArguments()[0].getText();
          callExpr.replaceWithText(text);
          thereWereReplacements = true;
        }
      });
    if (!thereWereReplacements)
      break;
  }
  return postProcess(inputFile.getFullText());
}

function getFunctionName(callExpression: CallExpression) {
  const node = callExpression.getChildAtIndex(0);
  return node.getText();
}
