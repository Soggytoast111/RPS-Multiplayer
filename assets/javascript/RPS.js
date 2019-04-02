//Firebase Config -- do not touch
var config = {
    apiKey: "AIzaSyCftRo3in_GMlPWAYSn-3Ge1e0WOmvecM0",
    authDomain: "bootcamptest-jonc.firebaseapp.com",
    databaseURL: "https://bootcamptest-jonc.firebaseio.com",
    projectId: "bootcamptest-jonc",
    storageBucket: "bootcamptest-jonc.appspot.com",
    messagingSenderId: "1062736294105"
  };
  firebase.initializeApp(config);

var database = firebase.database()
var playerKey = ""
var opponentKey = ""

//Continue Btn Event to initiate game
$("#continue-btn").on("click", function(event) {
    event.preventDefault()

    var username = $("#username-input").val().trim()
    console.log(username)

    playerKey = database.ref("game-info").push({
        username: username,
        status: 0,
        RPS: 0
        }).key

    database.ref("game-info").once("value", function() {
        database.ref("pair").once("value", function (snapshot) {
               if (snapshot.val() == null) {
                    database.ref("pair").set({
                        "playerKey": playerKey
                    })
                }

                else {
                    opponentKey = snapshot.val().playerKey
                database.ref("game-info").child(playerKey).update({
                    opponentKey: opponentKey
                })
                .then(function(){
                    database.ref("game-info").child(opponentKey).update({
                        "opponentKey": playerKey
                    })
                })
                }
            })
    })
})
