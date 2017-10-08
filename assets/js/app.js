var YTK = YTK || {};

YTK.rps = (function() {
  var 
  gameObj = {
    name : '',
    startTime : ''
  },
  initGameObj = function($nameTxtBox) {
    setPlayerName($nameTxtBox);
    gameObj.startTime = Date.now();
  },
  hideDiv = function($div) {
    $div.addClass('hidden');
  },
  showDiv = function($div) {
    $div.removeClass('hidden');
  },
  initGreeting = function() {
    $messageDiv = $('.message', '.greeting');
    $messageDiv.html('Greeting! ' + gameObj.name);
  },
  setPlayerName = function($nameTxtbox) {
    var playerName = $nameTxtbox.val().trim();

    if (playerName !== '') {
      gameObj.name = playerName;
    }
  },
  bindStartBtn = function() {
    $startBtn = $('.start-btn'),
    $nameTxtbox = $('.player-name');    

    $startBtn.on('click', function() {
      initGameObj($nameTxtbox);
      startGame();
    });

    // for pressing the "enter" key
    $nameTxtbox.on('keyup', function(e) {
      if (e.keyCode == 13) {
        initGameObj($nameTxtbox);
        startGame();
      }
    });
  },
  enableChat = function() {
    $('.chat-input').prop('disabled', false);
  },

  bindChatSubmitBtn = function() {
    $submitBtn = $('.chat-submit'),
    $chatInput = $('.chat-input');

    $submitBtn.on('click', function() {
      var chatContent = $chatInput.val().trim();

      if (chatContent !== '') {
        
        YTK.db.dbPush('chat', {
          user : gameObj.name, 
          chat : chatContent,
          time : firebase.database.ServerValue.TIMESTAMP
        });

        $chatInput.val('');
      }
    });
  },
  formatTime = function(timestamp) {
    var date = new Date(timestamp);

    return date.getHours() + ':' + date.getMinutes();
  },
  putChat = function(chatObj) {
    // only display relevant chats
    if (chatObj.time >= gameObj.startTime) {
      $chatBox = $('.chat-box'),
      $newChat = $('<div class="chat">'),
      $timeSpan = $('<span class="time">(' + formatTime(chatObj.time) + ')</span>'),
      $userSpan = $('<span class="user">' + chatObj.user + ':</span>'),
      $chatSpan = $('<span class="chat">"' + chatObj.chat + '"</span>');

      $newChat.append($timeSpan);
      $newChat.append($userSpan);
      $newChat.append($chatSpan);

      $chatBox.append($newChat);  
    }
  },
  startGame = function() {
    hideDiv($('.name-form'));
    initGreeting();
    showDiv($('.greeting'));
    enableChat();
    YTK.db.dbBind('chat', 'child_added', function(snapshot) {
      putChat(snapshot.val());
    });
  },
  initPage = function() { // function to call on page load
    bindStartBtn();
    bindChatSubmitBtn();
  };

  return {
    initPage : initPage
  }
})();

$(function() {
  YTK.rps.initPage();
});