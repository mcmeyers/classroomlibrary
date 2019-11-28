//This is the javascript file for the classroom library system 
//Some of this code was taken from Claire Bergy (Grice project), Long Ouyang (Coinflip project), Madeline Meyers (Iterated Learning project)
//Madeline Meyers Classroom Library System

// GENERAL FUNCTIONS 

// Shows slides
function showSlide(id) {
  $(".slide").hide();
  $("#"+id).show();
}

//gets current date
getCurrentDate = function() {
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  return (month + "/" + day + "/" + year);
}

//gets current time 
getCurrentTime = function() {
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();

  if (minutes < 10) minutes = "0" + minutes;
  return (hours + ":" + minutes);
}

//function to start timer 
function startTimer(duration, display) {
  var timer = duration, seconds;
  setInterval(function () {
    seconds = parseInt(timer % 60, 10);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = seconds;
    if (--timer < 0) {
      timer = duration;
    }
  }, 1000);
}

//function to reset timer
function clearTimer(display){
  var duration = 0
  var timer = duration, seconds;
  setInterval(function () {
    seconds = parseInt(timer % 60, 10);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = seconds;
    if (--timer < 0) {
      timer = duration;
    }
  }, 1000);
}

//SYSTEM SETUP 

//inputs sounds 
var ding = document.getElementById("ding");
var end_sd = document.getElementById("end_sd");
var halfway = document.getElementById("halfway");
var training_1_error = document.getElementById("training_1_error");
var training_2 = document.getElementById("training_2");
var trial_1 = document.getElementById("trial_1");
var timeout = document.getElementById("timeout");
var one_left = document.getElementById("one_left");
var errorSound = document.getElementById("errorSound");
var sparkle = document.getElementById("sparkle");

//initializes timer variable
var timer; 

//MAIN EXPERIMENT
var experiment = {


  ////////VARIABLES

  //bkgd
  date: getCurrentDate(),
  timestamp: getCurrentTime(), 
  //storing data 
  data:[],
  title:[],
  author:[],
  status:[],
  person:[],


  ////////FUNCTIONS  

  //reads in data from Google Sheet 
  loadLibData: function(){
    console.log("running");
  //makes request to sheet
    request = $.ajax({
      url: "https://script.google.com/macros/s/AKfycbwfMe0OlnSbShDRjONVtu0U1tCrXyfx5DH7Q4G7mtjmXDw1FZY/exec",
      type: "get", 
      dataType: "json",
      data: {}, 
    }); 
    request.done(function (data){
      //loads data from google sheet and saves to particular variables 
      experiment.data = data; 

	  experiment.title = experiment.data.map(function(value,index) { return value[0]; });
	  experiment.author = experiment.data.map(function(value,index) { return value[1]; });
	  experiment.status = experiment.data.map(function(value,index) { return value[6]; });
	  experiment.person = experiment.data.map(function(value,index) { return value[7]; });

      console.log(data);
    }); 

  },

  sparkle: function(){
    sparkle.play(); 
  },

  //writes data to Google Sheet using ajax POST function
  submit: function(){
  console.log(experiment.training_1_accuracy);
  console.log(experiment.training_2_accuracy);
  experiment.training_accuracy = (experiment.training_1_accuracy + experiment.training_2_accuracy) / 2;
  //make maxed out generations or people who timed out unavailable
  if(experiment.timedOut == 1 || experiment.generation == 12 || experiment.training_accuracy < 0.75){
    experiment.available_onload = 0;
    experiment.available_accepted = 0; 
  }
  //display whether data has been sent or not
    $("#result").html('Sending data...');
  
  //concatenates all important info into correct format to be posted 
    var allData = "unique_id="+experiment.unique_id + "&" + "parent_id="+experiment.parent_id + "&" + "child_id="+""+"&"+"sub_id="+experiment.subid + "&" + "sub_age="+experiment.subage + "&" + "generation="+experiment.generation + "&" + "seed="+ experiment.seed + "&" + "condition="+experiment.condition + "&" + "date="+experiment.date + "&" + "time="+experiment.timestamp + "&";
    allData += experiment.dataforRound+"&"+"available_onload="+experiment.available_onload+"&"+"available_accepted="+experiment.available_accepted+"&"+"timedOut="+experiment.timedOut+"&"+"training_accuracy="+experiment.training_accuracy+"\n";

  //ajax post request
    request = $.ajax({
      url: "https://script.google.com/macros/s/AKfycbym5ORQpTW0gSFmRQsNWuGdPyuXe55ewgS8Da-XBxUnRBlPlyjw/exec",
      type: "post", 
      data: allData
    });  

    request.done(function (response, textStatus, jqXHR){
      // log a message to the console
      $("#result").html('Data has been submitted!');
      //submit data to mTurk (just in case something bad happens and the google sheet doesnt work, good to have 2 copies)
      setTimeout(function(){turk.submit(experiment)}, 3000);
    });
  },

  //calls when experiment is finished; shows ending slide and submits data
  end: function(){
    showSlide("end");
    experiment.submit(); 
  },


  //makes dinging sound
  ding: function(){
   $("#trialGrid td").unbind("click");
   $("#trialGrid td.clicked").click(function(){
      ding.play();
    }); 
  },

  //stores data in arrays
  storeData: function(input, target, trialCount){
    //trialcount 3 was used to display some instructions so we want to skip that 
    if(trialCount != 3){
      var dataArray= [[0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0]];

      var targetArray= [[0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0],
              [0,0,0,0,0,0,0,0]];
              
      var rowIndex = 0;
      var cellIndex = 0;
      var i;
      var count=0; 
      for(i=0; i<64; i++){
        var gridElement = document.getElementById(input).rows[rowIndex].cells[cellIndex];
        var targetElement = document.getElementById(target).rows[rowIndex].cells[cellIndex];
        if(gridElement.classList == "clicked"){
          dataArray[rowIndex][cellIndex] = 1;
          count++; 
        }
        if(targetElement.classList == "clicked"){
          targetArray[rowIndex][cellIndex] = 1; 
        }
        cellIndex++; 
        if(cellIndex == 8) {
          rowIndex++;
        if(rowIndex == 8){
          if(count > 10 || count < 10){
            experiment.timedOut = 1; 
          }
        } else{
          cellIndex = 0; 
        }
        } 
      } 
    //gets arrays in string format of ("1 0 1 0 1 1 0 0 0 0 0"), necessary for posting to google sheet
      targetArray = [].concat.apply([], targetArray);
      dataArray = [].concat.apply([], dataArray);
      targetArray = targetArray.join(" ");
      dataArray = dataArray.join(" ");

      var trialCount = experiment.trialCount.toString(); 

    //if experiment is not over, keep adding data to one big long string which can then be called (the data string) in submit function; in correct format for posting to google sheet
      if(experiment.trialCount < 10){
        if(experiment.trialCount != 2.5){
        experiment.dataforRound += "&" + "trial"+trialCount+"Count="+experiment.trialCount + "&" + "trial"+trialCount+"Display="+experiment.trial + "&" + "time"+trialCount+"Used="+experiment.timeUsed + "&" + "target"+trialCount+"Array="+targetArray + "&" + "data"+trialCount+"Array="+dataArray + "\n"; 
      } if(experiment.trialCount == 2.5){
        experiment.dataforRound += "&" + "trial3Count="+experiment.trialCount + "&" + "trial3Display="+experiment.trial + "&" +"time3Used="+experiment.timeUsed + "&"+ "target3Array="+targetArray+"&"+"data3Array="+dataArray+"\n";
      }
    }
 
    //RN, also have the data send round by round FOR TURK EXPERIMENTS just in case this google sheets stuff glitches during the study 
      var dataforServer= experiment.subid + "," + experiment.subage + "," + experiment.generation + "," + experiment.seed + "," + experiment.condition + "," + experiment.date + "," + experiment.timestamp + ","; 
      dataforServer += experiment.trialCount + "," + experiment.trial + "," + experiment.timeUsed + "," + targetArray + "," + dataArray + "\n"; 

    //use line below for writing backups to turk or server 
    if(participants == "adult"){
      experiment.data.push(dataforServer);
    } if(participants == "child"){
      $.post("https://callab.uchicago.edu/experiments/iterated-learning/datasave.php", {postresult_string : dataforServer}); 
    }
    }
  },



  //displays target slide, stores data, handles counter for trials and ends study when 10 trials have passed 
  begin: function(){
    console.log(experiment.trialCount);
    document.getElementById("button").style.backgroundColor = "white";
    document.getElementById("button").disabled = false;
    document.querySelector('#blocksLeft').textContent = 10; 

    //disables scrolling
    document.ontouchmove=function(event){
      event.preventDefault();
    }

    var trialGrid = document.getElementById("trialGrid");
    var trialInput = document.getElementById("trialInput");

    //stores data by trial
    if(experiment.trialCount != 0){
      if(experiment.trialCount == 1 || experiment.trialCount == 2 || experiment.trialCount == 2.5){
        experiment.checkGrid('trialInput', 'trialGrid');
      }
      experiment.storeData("trialInput", "trialGrid", experiment.trialCount);
    } 
    //increases trial #
    var tmp =0; 
     if(experiment.trialCount == 2) {
    experiment.trialCount = 2.5; 
    tmp = 1; 
    } if(experiment.trialCount != 2 && experiment.trialCount != 2.5){
    experiment.trialCount++;
    } if(experiment.trialCount == 2.5 && tmp != 1){
      experiment.trialCount = 3; 
    }
    //clears grid
    experiment.clear("trialGrid");

    //trial 3 used for instructions; want to display those and skip this slide 
    if(experiment.trialCount ==3){
      showSlide("expIntro");
      sparkle.play();
      $(practiceIntro).html('<p class = "block-text">You have finished the training, and now we are going to begin the study.</p><p class = "block-text"> Just like in the practice, try to remember and recreate the grids to the best of your ability. </p><p class = "block-text">There will be 6 trials. </p>');
      return;  
    }
    if(experiment.trialCount == 2){
      experiment.trial = 0.5; 
    } if(experiment.trialCount == 2.5){
      experiment.trial = 0.75; 
    }

    //ends experiment when 6 trials + 2 trainings + trial 3 weirdness = 9 completed, so when gets called a 10th time 
    if(experiment.trialCount == 10){
      end_sd.play(); 
      experiment.end();
    } else {  //if experiment is not done
      if(experiment.trialCount != 1 && experiment.trialCount != 2 && experiment.trialCount != 2.5){ //if we are not in the trial rounds, which have pre-specified grids in pre-specified order
        experiment.trial = experiment.getRandomDisplay(experiment.displayNum); //get our random display
      }
      //shows target slide for X seconds 
      showSlide("trial");  
      //CHANGE ME BEFORE PILOT ******                              
      setTimeout(function(){ experiment.mask() }, 10000);

      if(experiment.trialCount > 3 & experiment.trialCount < 10){ //if in the study trials, not training
        //displays how many trials you have left before being done
        document.getElementById("progress").style.display = "block"; 
        $(progressNo).html(10-experiment.trialCount);
      } else{ //if in training trials
        document.getElementById("progress").style.display = "none";
      }

      //displays each individual trial info; gets called if the random display chooses that number
      //training trials 
      if(experiment.trialCount == 1){ 
        experiment.fillGrid("trialGrid", train1);
        experiment.ding();
        experiment.colorAdd("aqua");
      } if(experiment.trialCount == 2){ 
          experiment.fillGrid("trialGrid", train2);
          experiment.ding();
          experiment.colorRemove();
          experiment.colorAdd("yellow");
          console.log("running");
      } if(experiment.trialCount == 2.5){ 
          experiment.fillGrid("trialGrid", train3);
          experiment.ding();
          experiment.colorRemove();
          experiment.colorAdd("red");
      }
      //study trials
      if(experiment.trial == 1){
        experiment.fillGrid("trialGrid", trialNames[0]);
        experiment.ding();
        experiment.colorRemove();
        experiment.colorAdd("purple");
      } if(experiment.trial ==2){
          experiment.fillGrid("trialGrid", trialNames[1]);
          experiment.ding();
          experiment.colorRemove();
          experiment.colorAdd("green");
      } if(experiment.trial == 3){
          experiment.fillGrid("trialGrid", trialNames[2]);
          experiment.ding();
          experiment.colorRemove();
          experiment.colorAdd("maroon");
      } if(experiment.trial == 4){
          experiment.fillGrid("trialGrid", trialNames[3]);
          experiment.ding();
          experiment.colorRemove();
          experiment.colorAdd("orange");
      } if(experiment.trial== 5){
          experiment.fillGrid("trialGrid", trialNames[4]);
          experiment.ding();
          experiment.colorRemove();
          experiment.colorAdd("teal");
      } if(experiment.trial==6){
          experiment.fillGrid("trialGrid", trialNames[5]);
          experiment.ding();
          experiment.colorRemove();
          experiment.colorAdd("blue");
        } 
    }
  },



  //called on "ready for next trial" click; plays sounds if applicable before moving onto next trial
  playSound: function(){
    if(experiment.trialCount == 5){
      trial_1.play();
      clearInterval(timer);
      document.getElementById("button").disabled = true;
      $('#trialInput td').off('click')
      setTimeout(function() { experiment.keepGoing(); }, 3500); 
      return;
    } if(experiment.trialCount == 6){
      halfway.play();
      clearInterval(timer);
      document.getElementById("button").disabled = true;
      $('#trialInput td').off('click')
      setTimeout(function() { experiment.keepGoing(); }, 3500); 
      return;
    } if(experiment.trialCount == 8){
      one_left.play();
      clearInterval(timer);
      document.getElementById("button").disabled = true;
      $('#trialInput td').off('click')
      setTimeout(function() {experiment.keepGoing(); }, 2500); 
      return;
    } if(experiment.trialCount != 5 & experiment.trialCount != 6 & experiment.trialCount !=8){
      experiment.keepGoing(); 
    } 
  },

}



