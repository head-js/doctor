const { declare } = require('@babel/helper-plugin-utils');


module.exports = declare((api, options) => {
  api.assertVersion(7);

  const { types: t } = api;

  return {
    name: '@head/cli-babel-plugin-summerize',

    visitor: {
      JSXExpressionContainer(path) {
        if (t.isCallExpression(path.node.expression)) {
          // console.log(path.node.expression.callee.object);
          // console.log(path.node.expression.callee.property);
          // console.log(path.node.expression.arguments);

          if (path.node.expression.callee.property.name === 'map') {
            const element = path.node.expression.arguments[0].body;
            const opening = element.openingElement;
            // console.log(opening);
            opening.leadingComments = t.stringLiteral(` {% ${path.node.expression.callee.object.name}.${path.node.expression.callee.property.name} %}`);
            // opening.trailingComments = t.stringLiteral('{% endfor %}');

            path.replaceWith(opening);
            path.skip();
          }
        }
      },

      JSXElement: {
        enter(path) {
          // console.log(path.node.type);

          if (path.node.openingElement) {
            path.node.children = path.node.children.filter(child => !t.isJSXText(child));
            path.node.children.unshift(t.jsxText("\n"));
            path.node.closingElement = null;
          }
        },

        exit(path) {
          if (path.parentPath.isReturnStatement()) {
            path.findParent((parentPath) => {
              if (parentPath.isProgram()) {
                parentPath.replaceWith(t.program([ t.expressionStatement(path.node) ]));
                path.stop();
              }
            });
          }
        },
      },
    },
  };
});
