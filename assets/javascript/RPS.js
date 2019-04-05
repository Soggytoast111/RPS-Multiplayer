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
var opponentSelect = 0
var rpsTable = ["Rock", "Paper", "Scissors"]

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
    }).then(function(snapshot){
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


        database.ref("game-info").child(opponentKey).once("value", function(snapshot) {
            if (snapshot.val().selection == null) {
                $('#modal-body').text("Waiting for Opponent's Selection...")
                $('#player-wait-modal').modal('toggle');
                
                database.ref("game-info").child(opponentKey).on("child_added", function(snapshot) {
                    console.log(snapshot.val())
                    if (snapshot.val() == 1 || 
                        snapshot.val() == 2 ||
                        snapshot.val() == 0) {
                            $("#title").fadeOut(2000)
                            $("#rock-btn").fadeOut(2000)
                            $("#paper-btn").fadeOut(2000)
                            $("#scissors-btn").fadeOut(2000)
                            opponentSelect = snapshot.val()
                            $('#player-wait-modal').modal('toggle');
                            database.ref("game-info").off()
                            console.log("Checkwinner1-IF")
                            checkWinner()
                    }
                })
            }
            else {
                $("#title").fadeOut(2000)
                $("#rock-btn").fadeOut(2000)
                $("#paper-btn").fadeOut(2000)
                $("#scissors-btn").fadeOut(2000)
                opponentSelect = snapshot.val().selection
                console.log("Checkwinner2-ELSE")
                checkWinner()
            }
        })
    }   
}


$("#rock-btn").on("click", function(event) {
    event.preventDefault()
    selection(0)
})

$("#paper-btn").on("click", function(event) {
    event.preventDefault()
    selection(1)
})

$("#scissors-btn").on("click", function(event) {
    event.preventDefault()
    selection(2)
})

function checkWinner() {
    setTimeout(function(){
        $("#yourChoice").text("You Chose:  " + rpsTable[rpsSelect])
        $("#opponentChoice").text("Your opponent Chose:  " + rpsTable[opponentSelect])
        $("#jumbotron").fadeIn(1000)
        }, 1000)
}