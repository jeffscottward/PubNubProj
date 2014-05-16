// Protect Global Namespace
// Execute Function Immediately
(function(){

  // Basic App setup
  var RPSapp = {};
      RPSapp.fingerCount;
      RPSapp.playerChoice;
      RPSapp.displayArea = {
        playerList: $('#player-list'),
        thisUser: $('#thisUser')
      }; // Temporary Display area
      RPSapp.pubNub; // PubNub API
      RPSapp.thisUserID;
      RPSapp.init = function (){
        initPubNub();
        subscribeToPubNubChannel();
        getCurrentChannelStatus();
        initLeap();
      }

  // For Testing only
  function callStackReporter(funcName) {
    console.log(funcName);
  }

  //Setup new PubNub Object c w/ auth Keys
  function initPubNub() {
    callStackReporter('initPubNub()');

    RPSapp.pubNub = PUBNUB.init({
      publish_key   : 'pub-c-d1d43525-54ef-4f9d-a6d3-909d601cc3f4',
      subscribe_key : 'sub-c-2885c358-da26-11e3-bf22-02ee2ddab7fe',
      uuid: assignUniqueID()
    });
  }

  // Subscribe to channel and broadcast you have done so
  function subscribeToPubNubChannel() {
    callStackReporter('subscribeToPubNubChannel()');
    RPSapp.pubNub.subscribe({
      channel : "RPSchannel",
      message : function(msg) {

        var newUserID = msg.newUser;
        var user = msg.user;
        var choiceUpdate = msg.choiceUpdate;

        if (newUserID) {
          var newUsrDOMel = document.createElement('li');
              newUsrDOMel.setAttribute('id',newUserID);
              newUsrDOMel.classList.add('externalUser');

          RPSapp.displayArea.playerList.append(newUsrDOMel);
        }

        if(choiceUpdate) {
          $('#' + user).attr('class',choiceUpdate);
        }

      },
      connect : onChannelJoin()
    });
  }

  // Create unique ID for this client user
  function assignUniqueID() {
    callStackReporter('assignUniqueID()');
    RPSapp.thisUserID = PUBNUB.uuid();
    return RPSapp.thisUserID;
  }

  // On initial connection push a message
  // To broadcast a user joining
  function onChannelJoin() {
    callStackReporter('onChannelJoin()');

    // Broadcast a new user has joined
    RPSapp.pubNub.publish({
      channel : "RPSchannel",
      message : {
        newUser: RPSapp.thisUserID,
        bodyMsg: "The challenger " + RPSapp.thisUserID + " appears! Get ready to fight!"
      }
    });
  }

  // Update this players choice on the channel
  function playerChoiceUpdate() {
    callStackReporter('playerChoiceUpdate()');

    RPSapp.pubNub.publish({
      channel : "RPSchannel",
      message : {
        user: RPSapp.thisUserID,
        choiceUpdate: RPSapp.playerChoice,
        bodyMsg: "The challenger " + RPSapp.thisUserID + " chose " + RPSapp.playerChoice
      }
    });
  }

  // Get the current state of the channel
  function getCurrentChannelStatus() {
    callStackReporter('getCurrentChannelStatus()');

    RPSapp.pubNub.here_now({
      channel : 'RPSchannel',
      callback : function(msg){console.log(msg)}
    });
  }

  // Update the DOM
  function uiUpdater() {
    callStackReporter('uiUpdater()');

    // Figure out which choice it is
    // Clear the classes and add approriate one
    // Publish the choice
    switch (RPSapp.playerChoice) {
    case 0:
      if (RPSapp.displayArea.thisUser.hasClass()) {
        RPSapp.displayArea.thisUser.removeClass()
      }
      break;
    case 1:
      if (!RPSapp.displayArea.thisUser.hasClass('rock')){
        RPSapp.displayArea.thisUser.attr( "class", "rock" )
        playerChoiceUpdate();
      }
      break;
    case 2:
      if (!RPSapp.displayArea.thisUser.hasClass('paper')){
        RPSapp.displayArea.thisUser.attr( "class", "paper" )
        playerChoiceUpdate();
      }
      break;
    case 3:
      if (!RPSapp.displayArea.thisUser.hasClass('scissors')){
        RPSapp.displayArea.thisUser.attr( "class", "scissors" )
        playerChoiceUpdate();
      }
      break;
    }

  }

  function choiceDetector(frame){
    callStackReporter('choiceDetector()');

    // If there is a hand present
    if(frame.hands.length > 0) {

        // Set fingerCount to current count of fingers
        RPSapp.fingerCount = frame.hands[0].fingers.length;

        // Set Rock Paper Scissors Status
        switch (RPSapp.fingerCount) {
        case 0:
          RPSapp.playerChoice = 1;
          break;
        case 5:
          RPSapp.playerChoice = 2;
          break;
        case 2:
          RPSapp.playerChoice = 3;
          break;
        }

        // Update UI
        uiUpdater();

    // If there is NOT a hand present
    } else {
      RPSapp.playerChoice = 0;
      uiUpdater();
    }

  }

  // For every frame
  function initLeap() {
    callStackReporter('choiceDetector()');

    Leap.loop(function(frame){
        choiceDetector(frame);
    });
  }

  // Fire the whole app
  RPSapp.init();

  // For Testing only
  window.getCurrentChannelStatus = getCurrentChannelStatus;

})();
