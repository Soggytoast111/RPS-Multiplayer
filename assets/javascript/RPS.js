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
var opponentName = ""
var gameActive = 0
var rpsSelect = 0

//Continue Btn Event to initiate game
$("#continue-btn").on("click", function(event) {
    event.preventDefault()

    var username = $("#username-input").val().trim()
    console.log(username)

    playerKey = database.ref("game-info").push({
        username: username
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
                    "opponentKey": opponentKey
                })
                .then(function(){
                    database.ref("game-info").child(opponentKey).update({
                        "opponentKey": playerKey
                    })
                })
                }
            })
    }).then(function(){
        database.ref("game-info").child(playerKey).once("value", function(snapshot) {
            if (snapshot.val().opponentKey == null) {
                $('#player-wait-modal').modal('toggle');
                
                database.ref("game-info").on("child_changed", function(snapshot) {
                    if (snapshot.val().opponentKey != null) {
                        opponentKey = snapshot.val().opponentKey
                        $('#player-wait-modal').modal('toggle');
                        database.ref("game-info").off()
                        gameStart()
                    }
                })
            }
            
            else {
                database.ref("pair").remove()
                gameStart()
            }
        })
    })
})

function gameStart() {
    setTimeout(function() {
    database.ref("game-info").child(playerKey).once("value", function(snapshot){
        opponentKey = snapshot.val().opponentKey
        console.log(opponentKey)
    }).then(function(snapshot){
        console.log(snapshot.val().opponentKey)
            database.ref("game-info").child(snapshot.val().opponentKey).once("value", function(snapshot){
            opponentName = snapshot.val().username
            })
        })

    
    $("#top-image").fadeOut(1000)
    $("#title").fadeOut(1000)
    $("#input").fadeOut(1000)
    $("#continue-btn").fadeOut(1000)
    setTimeout(function() {
        $("#title").text("Opponent: " + opponentName)
        $("#title").fadeIn(1000)
        $("#rock-btn").fadeIn(1000)
        $("#paper-btn").fadeIn(1000)
        $("#scissors-btn").fadeIn(1000)
        gameActive = 1
    }, 1000)
    }, 500)
}

function selection(RPS) {
    if (gameActive == 1) {
    rpsSelect = RPS
    database.ref("game-info").child(playerKey).update({
        "selection": RPS
    })
    $("#title").fadeOut(1000)
    $("#rock-btn").fadeOut(1000)
    $("#paper-btn").fadeOut(1000)
    $("#scissors-btn").fadeOut(1000)
}
}

$("#rock-btn").on("click", selection(0))
$("#paper-btn").on("click", selection(1))
$("#scissors-btn").on("click", selection(2))
