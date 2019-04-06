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
var rpsImage = ["assets/images/rock-t.png", "assets/images/paper-t.png", "assets/images/scissors-t.png"]
var wins = 0
var losses = 0
var ties = 0
var winLoseArray = ["It's a Tie!", "You Lose!", "You Win!"]
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
                $("#modal-body").text("Waiting for Opponent...")
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
            "selection": RPS,
            "playAgain": "wait"
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
    
    if(rpsSelect == opponentSelect) {
        winLose = 0
        ties++
    }

    else if (rpsSelect - opponentSelect == -1 || rpsSelect - opponentSelect == 2 ) {
        winLose = 1
        losses++
    }

    else if (rpsSelect - opponentSelect == -2 || rpsSelect - opponentSelect == 1) {
        winLose = 2
        wins++
    } 
    setTimeout(function(){
            $("#rpsHead").text("Rock, Paper, Scissors... SHOOT!")
            $("#ties").hide()
            $("#yourChoice").text("You Chose:  " + rpsTable[rpsSelect])
            $("#your-img").attr("src", rpsImage[rpsSelect]).show()
            $("#opponentChoice").text("Your Opponent Chose:  " + rpsTable[opponentSelect])
            $("#opponent-img").attr("src", rpsImage[opponentSelect]).show()
            $("#paButton").hide()
            $("#resetButton").hide()
            $("#jumbotron").fadeIn(1000)
            }, 1000)

    setTimeout(function(){  
        $("#jumbotron").fadeOut(1000,function(){
            $("#rpsHead").text(winLoseArray[winLose])
            $("#yourChoice").text("Wins:  " + wins)
            $("#your-img").hide()
            $("#opponentChoice").text("Losses:  " + losses)
            $("#opponent-img").hide()
            $("#ties").text("Ties:  " + ties).show()
            $("#hr").hide()
            $("#paButton").show()
            $("#resetButton").show()
            $("#jumbotron").fadeIn(1000)
        })
    }, 7000)
}

$("#paButton").click(function(event){
    event.preventDefault()
    database.ref("game-info").child(playerKey).update({
        "playAgain": "yes"
    }).then(
        database.ref("game-info").child(opponentKey).child("playAgain").once("value", function(snapshot){
            console.log("Opponent PlayAgain:" + snapshot.val())
            if(snapshot.val() == "yes") {
                softreset()
            }

            else if (snapshot.val() == "wait") {
                $('#modal-body').text("Waiting for Opponent...")
                $('#player-wait-modal').modal('toggle');
                
                database.ref("game-info").child(opponentKey).on("child_changed",function(snapshot){
                    console.log("Opponent-Play:  " + snapshot.val())
                    if (snapshot.val() == "yes") {
                        database.ref("game-info").child(playerKey).update({
                            "playAgain": "wait"
                        })
                        database.ref().off()
                        $('#player-wait-modal').modal('toggle');
                        softreset()
                    }

                    else if(snapshot.val() == "no") {
                        database.ref("game-info").child(playerKey).update({
                            "playAgain": "wait"
                        })
                        $('#player-wait-modal').modal('toggle');
                        alert("Opponent has disconnected!")
                        reset()
                    }

                })
            }
        
            else if(snapshot.val() == "no") {
                database.ref("game-info").child(playerKey).update({
                    "playAgain": "wait"
                })
                alert("Opponent has disconnected!")
                reset()
            }
        
        })
    )

})

$("#resetButton").click(function(event){
    event.preventDefault()
    database.ref("game-info").child(playerKey).update({
        "playAgain": "no"
    })
    reset()
})

function reset() {
    playerKey = ""
    opponentKey = ""
    opponentName = ""
    gameActive = 0
    rpsSelect = 0
    opponentSelect = 0

    $("#jumbotron").toggle()
    $("#your-img").toggle()
    $("#opponent-img").toggle()
    $("resetButton").toggle()
    $("paButton").toggle()
    $("#top-image").fadeIn(1000)
    $("#title").fadeIn(1000)
    $("#input").fadeIn(1000)
    $("#continue-btn").fadeIn(1000)
}

function softreset() {
    database.ref("game-info").child(playerKey).child("selection").remove()
    $("#jumbotron").hide()
    $("#title").text("Opponent: " + opponentName)
    $("#title").fadeIn(1000)
    $("#rock-btn").fadeIn(1000)
    $("#paper-btn").fadeIn(1000)
    $("#scissors-btn").fadeIn(1000)
    gameActive = 1
}