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
  classList:[],


  ////////FUNCTIONS  

  //reads in data from Google Sheet, stores to particular variables on load (html)
  loadLibData: function(){
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

  //loads in class list -- names of students for buttons
  loadClassData: function(){
  //makes request to sheet
    request = $.ajax({
      url: "https://script.google.com/macros/s/AKfycbw_r1815As_agzs_CUh40RhfCsvUbewHviVUn5u6SRfEewFZQE/exec",
      type: "get", 
      dataType: "json",
      data: {}, 
    }); 
    request.done(function (data){
      //loads data from google sheet and saves to particular variables 
      experiment.classList = data; 

      console.log(experiment.classList);
      experiment.programClassData();
    });
    
  },

  //puts student names onto button labels
  programClassData: function(){
  	for(i=1; i<experiment.classList.length; i++){
  		var label = experiment.classList[i];
  		$("#S"+i+"out").html(label);
  		 $("#S"+i+"in").html(label);
	}
  },

  //function to find and display on html which books a student has checked out
  findIn: function(student){
  	var books = [];
  	//searches through data sheet to find where person == student
  	for(i=1; i<experiment.data.length; i++){
  		//if person = student in the sheet (the student had checked out the book)
  		if(experiment.data[i][7]==student){
  			//put the book title in this array
  			books[i-1] = experiment.data[i][0];
  			//creates button for the book
  			var btn = document.createElement("button");
  		//	btn.type = 'image';
  		//	btn.width = "100";
  			//btn.src = "https://cdn.pixabay.com/photo/2014/04/02/10/40/book-304187_1280.png";
			var src = document.getElementById("header");
  			//sets button attributes, makes draggable
  			btn.classList.add('btn');
  			btn.classList.add('rounded');
  			btn.classList.add('red');
  			btn.setAttribute('draggable', true);

  			btn.innerHTML = books[i-1];
  			src.appendChild(btn);               // Insert text
  		}
  	}
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


}



