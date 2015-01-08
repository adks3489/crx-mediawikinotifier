$(document).ready(function(){
  $("#inputAPIURL").val(localStorage.getItem("apiurl"));
  $("#inputTitle").val(localStorage.getItem("title"));
  $("#inputRangeStarter").val(localStorage.getItem("start"));
  $("#inputRangeEnder").val(localStorage.getItem("end"));
  $("#inputAnchor").val(localStorage.getItem("anchor"));

  $("#btnSave").click(function(){
    localStorage.setItem("apiurl", $("#inputAPIURL").val());
    localStorage.setItem("title", $("#inputTitle").val());
    localStorage.setItem("start", $("#inputRangeStarter").val());
    localStorage.setItem("end", $("#inputRangeEnder").val());
    localStorage.setItem("anchor", $("#inputAnchor").val());
  });
});