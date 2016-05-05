'use strict';

module.exports = function (_ref) {
  var t = _ref.types;

  var isReactClass = require('babel-helper-is-react-class')(t);

  var bodyVisitor = {
    ClassMethod: function ClassMethod(path) {
      if (path.node.key.name === 'render') {
        this.renderMethod = path;
      } else {
        this.isPure = false;
        path.stop();
      }
    },
    ClassProperty: function ClassProperty(path) {
      var name = path.node.key.name;

      if (path.node.static && (name === 'propTypes' || name === 'defaultProps')) {
        this.properties.push(path);
      } else {
        this.isPure = false;
      }
    },
    MemberExpression: function MemberExpression(path) {
      var node = path.node;

      // non-this member expressions dont matter

      if (!t.isThisExpression(node.object)) {
        return;
      }

      // Don't allow this.<anything other than props>
      if (!t.isIdentifier(node.property, { name: 'props' })) {
        this.isPure = false;
        path.stop();
        return;
      }

      // this.props.foo => props.foo
      this.thisProps.push(path);
    },
    JSXIdentifier: function JSXIdentifier(path) {
      if (path.node.name === 'ref') {
        this.isPure = false;
        path.stop();
      }
    }
  };

  return {
    visitor: {
      Class: function Class(path) {
        if (!isReactClass(path.node)) {
          // yo, fuck this class then.
          return;
        }

        var state = {
          renderMethod: null,
          properties: [],
          thisProps: [],
          isPure: true
        };

        // get the render method and make sure it doesn't have any other methods
        path.traverse(bodyVisitor, state);

        if (!state.isPure || !state.renderMethod) {
          // fuck this class too.
          return;
        }

        var id = t.identifier(path.node.id.name);

        var replacement = [];

        state.thisProps.forEach(function (thisProp) {
          thisProp.replaceWith(t.identifier('props'));
        });

        replacement.push(t.functionDeclaration(id, [t.identifier('props')], state.renderMethod.node.body));

        state.properties.forEach(function (prop) {
          replacement.push(t.expressionStatement(t.assignmentExpression('=', t.MemberExpression(id, prop.node.key), prop.node.value)));
        });

        if (t.isExpression(path.node)) {
          replacement.push(t.returnStatement(id));

          replacement = t.callExpression(t.functionExpression(null, [], t.blockStatement(replacement)), []);
        }

        path.replaceWithMultiple(replacement);
      }
    }
  };
};