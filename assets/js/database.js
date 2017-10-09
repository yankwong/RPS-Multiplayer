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
  dbBindListener = function(table, event, callback) {
    database.ref(table).on(event, callback);
  },
  dbSet = function(node, obj) {
    database.ref('/' + node).set(obj);
  };

  return {
    dbPush        : dbPush,
    dbRemoveItem  : dbRemoveItem,
    dbBind        : dbBindListener,
    dbSet         : dbSet
  }
})();