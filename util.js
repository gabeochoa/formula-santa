function vadd(a, b) {
  return p5.Vector.add(a, b);
}
function vsub(a, b) {
  return p5.Vector.sub(a, b);
}
function vmult(a, b) {
  return p5.Vector.mult(a, b);
}

function clipboard(txt) {
  console.log(txt);
  var cb = document.getElementById("cb");
  cb.value = txt;
  cb.style.display = "block";
  cb.select();
  document.execCommand("copy");
  cb.style.display = "none";
}

function export_path(inp) {
  console.log("exporting");
  const text = path.export_points();
  clipboard(text);
  inp.value(text);
}

function import_path(text) {
  console.log("importing");
  path.import_points(text);
}
