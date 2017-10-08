var YTK = YTK || {};

YTK.rps = (function() {
  var 
  database = firebase.database(),
  gameObj = {
    name : '',
    startTime : '',
    choice: '',
    refID: '',
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
        
        YTK.db.dbPush('/chat', {
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
    // connect to DB, setup user ID
    database.ref().once('value', function(snapshot) {
      var hasPlayer1 = snapshot.hasChild('0'),
          hasPlayer2 = snapshot.hasChild('1');

      console.log('value result', snapshot.val(), hasPlayer1, hasPlayer2);
      if (hasPlayer1 && hasPlayer2) {
        // can't join game
        console.log('game full');
      }
      else if (!hasPlayer1) {
        // you are player 1
        console.log('u r player 1');
        database.ref('/0').push(gameObj);
        gameObj.refID = '/0';
      }
      else {
        // you are player 2
        console.log('u r player 2');
        database.ref('/1').push(gameObj);
        gameObj.refID = '/1';
      }
    });

    hideDiv($('.name-form'));
    initGreeting();
    showDiv($('.greeting'));

    // setup RPS buttons
    bindOptionBtns();

    // setup Chat
    enableChat();
    YTK.db.dbBind('/chat', 'child_added', function(snapshot) {
      putChat(snapshot.val());
    });
  },
  setChoice = function(choice) {
    gameObj.choice = choice;
  },
  bindOptionBtns = function() {
    var $optBtns = $('.opt-btn');

    $optBtns.on('click', function() {
      var $this   = $(this),
          option  = $(this).attr('data-option');

      if (!$this.hasClass('disabled')) {
        $optBtns.addClass('disabled');
        $this.addClass('picked');
        setChoice(option);  


        // push player's choice to DB
        // 
      }
    });
  },

  initPage = function() { // function to call on page load
    
    $(window).bind("beforeunload", function() {

      if (gameObj.refID !== '') {
        database.ref(gameObj.refID).remove();

        // push to chat  
        YTK.db.dbPush('/chat', {
          user : 'System', 
          chat : gameObj.name + ' has left the game',
          time : firebase.database.ServerValue.TIMESTAMP
        });
      }
      
      return undefined;
    });

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