var Ascii = require('ascii');
var pic = new Ascii('demo.jpeg');
// output in terminal (terminal mode)
pic.convert(function(err, result) {
  console.log(result);
});

// output as html strings with css style (html mode)
pic.convert('html', function(err, html){
  console.log(html);
  // then save it
  require('fs').writeFileSync('demo.html',html);
});