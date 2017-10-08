// utility object to interact with FireBase
var YTK = YTK || {};

YTK.db = (function() {
  var 
  database = firebase.database(),
  dbPush = function(table, obj){
    database.ref(table).push(obj);
  },
  dbRemoveItem = function(key) {
    database.ref().child(key).remove();
  },
  dbBindEvent = function(table, event, callback) {
    database.ref(table).on(event, callback);
  };

  return {
    dbPush        : dbPush,
    dbRemoveItem  : dbRemoveItem,
    dbBind        : dbBindEvent
  }
})();