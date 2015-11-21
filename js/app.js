var console = console || {log:function(){}}; //IE protection

(function(){



	var today = moment();
	// Colors
	var colorStart = moment([2015, 0, 1]); // 1/1/2015
	var colors = ['orange','blue','red','green','gray','purple'];
	var colorIdx = 0;
	var daysToSkip = ['Fri','Sun'];
	var currentDay = moment();

	var init = function(){

		//	Call this when you want to redraw
		//		uses currentDay to know what month to draw
		var update = function() {
			drawCalendar( getDisplayDays() );
		};
		$("#prev").click( function(){
			currentDay.subtract({month:1});
			update();
		})
		$("#headline").click( function(){
			currentDay = moment();
			update();
		})
		$("#next").click( function(){
			currentDay.add({month:1});
			update();
		})
		update();
	}

	var getDisplayDays = function(){


		var monthStart = currentDay.startOf('month');
		var monthEnd = monthStart.clone().endOf('month');
		var weekStart = monthStart.clone().startOf('week');

		//
		//	Make an Array of weeks and days
		//
		var day = weekStart.clone();
		var week = day.week();

		var days = [];
		var weeks = [];
		while(true) {
			days.push(day);
			day = day.clone().add({day:1});
			if( week!= day.week()) {
				week = day.week();

				weeks.push(days);
				days = [];
				if( day.isAfter(monthEnd) ) {
					break;
				}
			}
		}
		return weeks;
	}

	//	Finds for the day provided which color it should be
	//		Technicly Sunday gets a color, you just never see it because the syles override that to grey
	var getColor = function( day ){


		var days = day.diff(colorStart, 'days');

		var startOffSet = 7-colorStart.day();
		var endOffSet = day.day();
		var daysWithFullWeeks = days - startOffSet - endOffSet;
		
		var fullWeeks = daysWithFullWeeks/7;
		var countableDays = fullWeeks*5; // We skip two of the days



		// Add back partial week start days
		switch( colorStart.day() ){
			case 0:
			case 1:
				countableDays += 4;
				break;
			case 2:
				countableDays += 3;
				break;
			case 3:
				countableDays += 2;
				break;
			case 4:
				countableDays += 1;
				break;
			case 5: //Fri
			case 6: //Sat
				countableDays += 0;
				break;
		}
		// Add back partial week end days
		switch( day.day() ){
			case 0:
				break;
			case 1:
				countableDays += 1;
				break;
			case 2:
				countableDays += 2;
				break;
			case 3:
				countableDays += 3;
				break;
			case 4:
				countableDays += 4;
				break;
			case 5: //Fri
			case 6: //Sat
				countableDays += 5;
				break;
		}
		

		if( days<3 ) {
			// We get negative days because of the discount, so there is a special caase for the first few days. 
			switch(days){
				case 0:
					countableDays = 0;
					break;
				case 1:
				case 2:
					countableDays = 1;
					break;
			}
		}

		return colors[countableDays%colors.length];
	};

	//	Holds the list of holidays and finds out if the given day is in that lis
	//
	var getHoliday = function(day){

		var byDate = {
			'01/01':'New Years',
			'07/04':'Independence Day',
			'11/11':'Veterans Day',
			'12/25':'Christmas',
		};
		var byDay = {
			'1/1/3':'Martin Luther King, Jr. Day', //  third Monday of January
			'2/1/3':"Presidents' Day", //the third Monday of February
			'9/1/1':'Labor Day', // first Monday of September
			'10/1/2':'Columbus Day', // second Monday of October
			'11/4/4':'Thanksgiving Day', // fourth Thursday of November

			// Memorial Day is below, it is special
		};
		var name = byDate[ day.format('MM/DD')];

		if( !name ) {
			var weeks = Math.floor((day.date()-1)/7)+1;
			console.log(day.format('M/d/')+weeks);
			name = byDay[ day.format('M/d/')+weeks];

		} 

		if( !name ) {
			var lastMondayMay = day.clone().endOf('month').month('May').day('Monday');
			if( lastMondayMay.month()>day.month() )
				lastMondayMay.subtract({week:1});
			if( day.isSame( lastMondayMay,'day')  )
				name = 'Memorial Day'; // the last Monday of May 
		}

		if( !name ) {
			name = "";
		}

		return name;
	};


	//	The HTML template. Edit this as needed
	//
	var drawCalendar = function( weeks ){

		var month = weeks[1][0]; // Grab a day in the middle of the array

		var daysHTML = "";
		for( var i in weeks ) {

			var days = weeks[i];

			// Start new week
			daysHTML += "<main>";
			for( var j in days ){
				var isMonth = days[j].month()==month.month();
				var isToday = days[j].isSame(today,'day');
				var color = getColor(days[j]);
				var day = days[j].format("ddd");
				var holidayName = getHoliday(days[j]);

				// Markup for one day
				daysHTML += '<span class="'+
					' month_'+isMonth+
					' today_'+isToday+
					' '+day+
					' '+color+
					(holidayName? " holiday ": "")+
					'"  >'+days[j].format("D")+'<p>'+holidayName+'</p>'+"</span>";
			}
			daysHTML += "</main>";
		}

		$("#headline").text(month.format("MMMM YYYY"));
		$("#calendar main").remove();
		$("#calendar").append(daysHTML);

	}

	init();

})();
