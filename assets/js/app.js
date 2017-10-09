var YTK = YTK || {};

YTK.rps = (function() {
  var 
  database = firebase.database(),
  gameObj = {
    name : '',
    startTime : '',
    choice: '',
    refID: -1,
    otherRefID: -1,
    win  : 0,
    lose : 0,
    draw : 0
  },
  enemyObj,
  gameReady = true,
  greetings = [
    "Let's beat the noobz",
    "Pick rock, you can punch them in the face w. it",
    "GL, show no mercy!",
    "Victory at all cost! Cheating is ok"
  ],
  getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    $messageDiv.html('Greeting! <strong>' + gameObj.name + '</strong>. ' + greetings[getRandomInt(0,3)]);
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
      var userName = $nameTxtbox.val().trim();

      if (userName !== '') {
        initGameObj($nameTxtbox);
        startGame();
      }
      
    });

    // for pressing the "enter" key
    $nameTxtbox.on('keyup', function(e) {
      if (e.keyCode == 13) {
        var userName = $nameTxtbox.val().trim();
        if (userName !== '') {
          initGameObj($nameTxtbox);
          startGame();
        }
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

    $chatInput.on('keyup', function(e) {
      if (e.keyCode == 13) {
        var chatContent = $chatInput.val().trim();

        if (chatContent !== '') {
          
          YTK.db.dbPush('/chat', {
            user : gameObj.name, 
            chat : chatContent,
            time : firebase.database.ServerValue.TIMESTAMP
          });

          $chatInput.val('');
        }
      }
    });
  },
  formatTime = function(timestamp) {
    var date = new Date(timestamp);

    return date.getHours() + ':' + date.getMinutes();
  },
  putChat = function(chatObj) {
    if (chatObj.time >= gameObj.startTime) { // only display relevant chats
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
  winGame = function() {
    gameObj.win++;
    gameObj.choice = '';
    enemyObj.lose++;
    YTK.db.dbSet(gameObj.refID, gameObj);
  },
  loseGame = function() {
    console.log('enemy before', enemyObj);
    gameObj.lose++;
    gameObj.choice = '';
    enemyObj.win++;
    console.log('enemy after', enemyObj);
    YTK.db.dbSet(gameObj.refID, gameObj);
  },
  drawGame = function() {
    gameObj.draw++;
    enemyObj.draw++;
    gameObj.choice = '';
    YTK.db.dbSet(gameObj.refID, gameObj);
  },
  displayScore = function() {
    var $p1Win  = $('.win', '.p1-score'),
        $p1Lose = $('.lose', '.p1-score'),
        $p1Draw = $('.draw', '.p1-score'),
        $p2Win  = $('.win', '.p2-score'),
        $p2Lose = $('.lose', '.p2-score'),
        $p2Draw = $('.draw', '.p2-score');

    $p1Win.html(gameObj.win);
    $p1Lose.html(gameObj.lose);
    $p1Draw.html(gameObj.draw);

    $p2Win.html(enemyObj.win);
    $p2Lose.html(enemyObj.lose);
    $p2Draw.html(enemyObj.draw);
    
  },
  resetOptionBtns = function() {
    var $optionBtns = $('.opt-btn', '.control');

    $optionBtns.removeClass('picked');
    $optionBtns.removeClass('disabled');

    gameReady = true;
  },
  checkWinLose = function(otherChoice){
    if (gameObj.choice == otherChoice) {
      drawGame();
    }
    else if (gameObj.choice == 'R') {
      if (otherChoice == 'P') {
        loseGame();
      }
      else {
        winGame();
      }
    }
    else if (gameObj.choice == 'P') {
      if (otherChoice == 'R') {
        winGame();
      }
      else {
        loseGame();
      }
    }
    else {
      if (otherChoice == 'R') {
        loseGame();
      }
      else {
        winGame();
      }
    }
  }
  startGame = function() {
    // connect to DB, setup user ID
    database.ref().once('value', function(snapshot) {
      var hasPlayer1 = snapshot.hasChild('0'),
          hasPlayer2 = snapshot.hasChild('1');

      if (hasPlayer1 && hasPlayer2) {
        console.log('game full');
        return false;
      }

      if (!hasPlayer1) {
        console.log('u r player 1');
        gameObj.refID = 0;
        gameObj.otherRefID = 1;
        YTK.db.dbSet(0, gameObj);
      }
      else {
        console.log('u r player 2');
        gameObj.refID = 1;
        gameObj.otherRefID = 0;
        YTK.db.dbSet(1, gameObj);
      }

      hideDiv($('.name-form'));
      initGreeting();
      showDiv($('.greeting'));

      // start listening to the other player's DB movement
      setupValueListener();

      // setup RPS buttons
      bindOptionBtns();

      // setup Chat
      enableChat();
      YTK.db.dbBind('/chat', 'child_added', function(snapshot) {
        putChat(snapshot.val());
      });
    });
  },
  setChoice = function(choice) {
    gameObj.choice = choice;
  },
  bindOptionBtns = function() {
    var $optBtns = $('.opt-btn');

    $optBtns.on('click', function() {
      var $this   = $(this),
          option  = $this.attr('data-option');

      if (!$this.hasClass('disabled')) {
        $optBtns.addClass('disabled');
        $this.addClass('picked');
        setChoice(option);

        // push player's choice to DB
        YTK.db.dbSet(gameObj.refID, gameObj);
      }
    });
  },

  setupValueListener = function() {
    database.ref().on('value', function(snapshot) {
      var hasPlayer1 = snapshot.hasChild('0'),
          hasPlayer2 = snapshot.hasChild('1'),
          dbData = snapshot.val();

      if (hasPlayer1 && hasPlayer2) {
        if (gameObj.choice !== '' && dbData[gameObj.otherRefID].choice !== '' && gameReady) {
          enemyObj = dbData[gameObj.otherRefID];
          gameReady = false;
          console.log('calculate who won!', enemyObj);
          checkWinLose(enemyObj.choice);
          displayScore();
          resetOptionBtns();
        }
      }
      else {
        console.log('resetting enemyObj to {}');
        enemyObj = {};
      }
    });
    
  },
  bindDisconnect = function() {
    $(window).bind("beforeunload", function() {

      if (gameObj.refID !== -1) {
        database.ref('/' + gameObj.refID).remove();

        // push to chat  
        YTK.db.dbPush('/chat', {
          user : 'System', 
          chat : gameObj.name + ' has left the game',
          time : firebase.database.ServerValue.TIMESTAMP
        });
      }
      return undefined;
    });
  },
  initPage = function() {
    
    bindDisconnect();
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