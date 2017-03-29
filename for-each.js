var recast = require("recast");
var types = recast.types;
var b = types.builders;

var esprima_e4x = require('./esprima-e4x.js');
var flow_parser = require("flow-parser");

var parser = esprima_e4x;
var code = `
for each (value in object){
}
`;

var ast = recast.parse(code, {esprima: esprima_e4x});
//console.log(ast.program.body)

recast.visit(ast, {
  visitForInStatement: function(path) {
    if (path.value.each === true)
    {
      var forStmt = path.value;
      // rename 'left' to left.name + 'Key'
      // TODO make sure the new name isn't taken. Can use
      // https://github.com/benjamn/ast-types#scope
      // for this
      var oldLeftName = forStmt.left.name;
      var newLeftName = oldLeftName + 'Key';
      forStmt.left.name = newLeftName;

      // declare new variable as follows
      // var current_name = right[left.name]
      var iteratorDecl = b.variableDeclaration("const", [b.variableDeclarator(
          b.identifier(oldLeftName),
          b.memberExpression(
            b.identifier(forStmt.right.name),
            b.identifier(newLeftName)
          )
        )
      ]);
      forStmt.body.body.push(iteratorDecl);
      forStmt.each = false;
    }
    if (typeof path.value.value === "string") {
      path.value.raw = '"lolwut"';
    }

    this.traverse(path);
  }
});


var output = recast.print(ast).code;

console.log("Before:\n" + code);
console.log("After:\n" + output);

/*
Before:

for each (value in object){
}

After:

for (valueKey in object) {
  const value = object.valueKey;
  }

*/
