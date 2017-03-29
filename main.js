var recast = require("recast");

var code = [
    "var a = '\\x45\\x23\\x45'",
    "var b = [ '\\x33\\x67\\87'];",
    "function foo() { return '\\x74\\x65\\x73\\x74'; }",
    "foo('\\x45\\x43\\x42');",
].join("\n");

var ast = recast.parse(code);

recast.visit(ast, {
  visitLiteral: function(path) {
    if (typeof path.value.value === "string") {
      path.value.raw = path.value.value;
    }

    this.traverse(path);
  }
});


var output = recast.print(ast).code;

console.log(output);
/*
var a = "E#E"
var b = [ "3g87"];
function foo() { return "test"; }
foo("ECB");
*/
