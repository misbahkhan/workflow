  var socket = io.connect('/');
  // var partlayout = function(id, name){
  // 	return '<tr id="'+id+'"> <td><span contenteditable="true" class="edit array"></span></td><td><span contenteditable="true" class="edit">'+name+'</span></td><td><span contenteditable="true" class="edit caps"></span></td><td><span contenteditable="true" class="edit num"></span></td><td><span contenteditable="true" class="edit"></span></td><td><span contenteditable="true" class="edit num"></span></td><td><input type="checkbox"></td><td><span contenteditable="true" class="edit"></span></td><td><span contenteditable="true" class="edit num"></span></td><td><input type="checkbox"></td><td><span contenteditable="true" class="edit"></span></td><td><span contenteditable="true" class="edit num"></span></td><td><input type="checkbox"></td><td><span contenteditable="true" class="edit"></span></td><td><input type="checkbox"></td><td><span contenteditable="true" class="edit"></span></td><td><input type="checkbox"></td></tr>';
  // }


  socket.on('update', function(of, id, property, value){
  	// if(of=="people"&&id=="all"&&property=="parts"){
  	// 	$("div."+value._id).html(value.name);
  	// }
  	property = property.split("_");
  	
  	if(property[1]){
  		property = property[0]+" "+property[1];
  	}
  	
  	if(of=="parts"){
  		overview(id, property, value);
  	}

  	if($("tr#"+id)[0]){
	    var cell = $($("#"+of).find("tr#"+id)[0].cells[$("#"+of).find("th:contains('"+property+"')").filter(function(){return $(this).html()==property;})[0].cellIndex].children[0]);
	  	var cell_parent = $($("#"+of).find("tr#"+id)[0].cells[$("#"+of).find("th:contains('"+property+"')").filter(function(){return $(this).html()==property;})[0].cellIndex]);
	  	if(cell.is(":checkbox")){
	  		if(value==1){
	  			cell.attr('checked', true);
	  		}else{
	  			cell.attr('checked', false);
	  		}
	  	}else if(cell.is("select")){
	  		$($(cell).children('option[value="'+value+'"]')[0]).attr("selected","selected");
	  	}else if(cell.is("input")){
	  		cell.val(value);
	  	}else if(cell.hasClass('array')||property=="parts"){
	  		if(cell.parent('td').find("div."+value._id)[0]){
	  			if(value.name==""){
	  				console.log('none');
	  				cell.parent('td').find("div."+value._id).remove();
	  			}else{
	  				console.log('some');
		  			cell.parent('td').find("div."+value._id).html(value.name);
	  			}
	  		}else{
	  			console.log('else');
	  			cell_parent.append("<div class='label caps array "+value._id+"'>"+value.name+"</div><br/>");
	  		}
	  	}else{
	  		cell.html(value);
	  	}
  	}
  });

  socket.on('add', function(of, id, name){
  	console.log(of);
  	$("#"+of).find("tbody").append('<tr id="'+id+'"> <td><input type="text" value="'+name+'" class="edit caps input-small"></td><td><select class="span2 narrow"><option>NONE</option><option>FLIGHT</option><option>CORE</option><option>ELEVATOR</option><option>ARM GAS</option><option>ARM HAS</option><option>ARM CLAW</option><option>ELECTRICAL HOUSING</option><option>CASING</option></select></td><td><input type="text" class="edit caps input-mini partNum"></td><td><input type="text" class="edit lower name input-mini supertiny"></td><td> <select class="span2 narrow system"><option selected="">QUEUED</option><option>PROGRESS</option><option>FINISHED</option></select></td><td><input type="text" data-provide="typeahead" auto-complete="off" class="edit lower name input-mini"></td><td><span contenteditable="true" class="edit">	</span></td><td><input type="text" class="edit lower name input-mini supertiny"></td><td><input type="checkbox"></td><td><input type="text" data-provide="typeahead" auto-complete="off" class="edit lower name input-mini"></td><td><span contenteditable="true" class="edit">		</span></td><td><input type="text" class="edit lower name input-mini supertiny"></td><td><input type="checkbox"></td><td><input type="text" data-provide="typeahead" auto-complete="off" class="edit lower name input-mini"></td><td><span contenteditable="true" class="edit">	</span></td><td><input type="text" class="edit lower name input-mini supertiny"></td><td><input type="checkbox"></td><td><input type="text" class="edit caps input-mini"></td><td><input type="checkbox"></td><td><input type="checkbox"></td><td><input type="checkbox"></td></tr>');
  	$("#overview").find("tbody").append('<tr class="error '+id+'"><td><span class="overview_CADer label"></span>&nbsp;<span class="overview_Drafter label label-info"></span>&nbsp;<span class="overview_CAMer label label-inverse"></span></td><td> <span class="overview_state">QUEUED</span></td><td><span class="overview_quantity badge"></span>&nbsp;<span class="overview_name label label-info">'+name+'</span>&nbsp;<span class="overview_cam label label-inverse"></span></td></tr>');
  }); 

  socket.on('chat', function(user, message){
  	$("#chat").find("#chatBox").prepend("<span class='message_wrap'><span class='message_from'>["+user+"]: </span><span class='message_text'>"+message+"</span></span><br/>")
  });

  socket.on('remove', function(of, id){
  	console.log(of);
  	$("#"+of).find("tr#"+id).remove();
  	if(of=="parts"){
  		$("#overview").find("tr."+id).remove();
  	}
  	$("div."+id).next().remove();
  	$("div."+id).remove();
  }); 

  var user; 

  var overview = function(id, toChange, value){
  	var systems = ["FLIGHT","CORE","ELEVATOR","ARM GAS","ARM HAS","ARM CLAW","ELECTRICAL HOUSING","CASING"];
  	var classes = ["flight", "core", "elevator", "gas", "has", "claw", "electrical", "casing"];
  	var changeClass = "overview_"+toChange;
  	var ele = $("tr."+id).find("."+changeClass);
  	
  	if(toChange=="system"){
  		var changeClass = "overview_quantity";
  		var changeClass2 = "overview_name";
  		var ele = $("tr."+id).find("."+changeClass);
  		var ele2 = $("tr."+id).find("."+changeClass2);
  		ele.removeClass('flight core elevator gas has claw electrical casing').addClass(classes[systems.indexOf(value)]);
  		ele2.removeClass('flight core elevator gas has claw electrical casing').addClass(classes[systems.indexOf(value)]);
  	}

  	if(toChange!="system"){
	  	ele.html(value);
	  	if(toChange == "state"){
	  		var toAdd = "";
	  		$("tr."+id).removeClass("success error warning");
	  		if(value=="QUEUED"){
	  			toAdd = "error";
	  		}else if(value=="PROGRESS"){
	  			toAdd = "warning";
	  		}else if(value=="FINISHED"){
	  			toAdd = "success";
	  		}
	  		$("tr."+id).addClass(toAdd);
	  	}
  	}
  }

  $(window).load(function(){
  	if(window.location.hash){
		$('#tabs a[href="'+window.location.hash+'"]').tab('show');
  	}

	$('#tabs a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});

  	$('.a-nav').on('shown', function (e) {
  		var hash = e.target.href.split('/');
  		var scrollmem = $('body').scrollTop();
		window.location.hash = hash[hash.length-1];
		$('html,body').scrollTop(scrollmem);
	});

  	$("body").keydown(function(e){
  		if(e.keyCode==27){
  			$("body").fadeOut();
  			window.location = '/logout';
  		}else if(e.keyCode==9){
  		}
  	});

  	$("body").keyup(function(e){
  		if(e.keyCode==9){
  			$("#key").hide();
  		}
  	});

  	$("#logo").fadeIn(500, function(){
  		$("#name").fadeIn(250).css("display","block").focus();
  	}).css("display","block");

	$(".login").keyup(function (e) {
		if (e.keyCode == 13) {
			if($(this).attr('placeholder')=="name"){
				$.get('/checkPerson', 'name='+$("#name").val(), function(data){
					if(data=='t'){
						user = $("#name").val();
						$("#name").hide();
						$("#pass").fadeIn().css("display","block").focus();
					}else{
						user = '';
						$("#name").focus().select();
					}
				});
			}else{
				$.get('/checkPass', 'name='+user+'&pass='+$("#pass").val(), function(data){
					if(data=='t'){
						$("#login_header").fadeOut(function(){
							location.reload();	
						});
					}else{
						$("#pass").hide().val('');
						$("#name").val('').show().css("display","block").focus();
					}
				});				
			}
		}
	});

	var update = function(of, id, property, value){
		$.get('/update', 'of='+of+'&id='+id+'&property='+property+'&value='+value, function(data){
			if(data=='t'){
				$("tr#"+id).addClass("success");
				setTimeout(function () {
    				$("tr#"+id).removeClass("success");
				}, 1000);
			}else{
				$("tr#"+id).addClass("error");
				setTimeout(function () {
    				$("tr#"+id).removeClass("error");
				}, 1000);
			}
		});	
	}

	var pre_update = function(thing, value){
		var property = thing.closest('table')[0].rows[0].cells[thing.parent()[0].cellIndex].innerHTML;
		var mult_prop = property.split(" ");
		if(mult_prop[1]){
			property = mult_prop[0]+"_"+mult_prop[1];
		}
		var id = thing.parents('tr').attr('id');
		var of = thing.parents('.pane').attr('id');
		if(of!="people"&&property!="name"&&!thing.is(":checkbox")){
			value.toUpperCase();
		}

		if(of=="parts"&&property=="name"){
			value = value.toUpperCase();
		}
		if(thing.hasClass('array')){
			value = [];
			$(("tr#"+id)[0]).find("span").each(function(){
				if($(this).html().trim()!=""){
					value.push($(this).html());
				}
			});
		}
		update(of, id, property, value);
	}

	var user_change = function(thing, value){
		var of = "people";
		var id = thing.parent().parent().children().attr('class');
		var property = thing.prev().html();
		console.log(property);
		update(of, id, property, value);
	}

	$(":checkbox").live('click', function(){
		var value = 0; 
		if($(this).is(":checked")){
			var value = 1;
		}
		pre_update($(this), value);
	});

	$(".edit").live('keydown', function(e){
		if(e.keyCode==13){
			e.preventDefault();
			if($(this).hasClass('array')){
				var value = [];
			}else if($(this).is("span")){
				var value = $(this).text().trim();
			}else if($(this).is("input")){
				var value = $(this).val().trim();
			}
			if($(this).hasClass('user')){
				user_change($(this), value);
			}else{
				pre_update($(this), value);
			}
		}
	});

	$("select").live('change', function(){
		pre_update($(this), $(this).find(":selected").html());
		console.log($(this).find(":selected").html());
	});

	$(".plus").click(function(){
		$.get('/add', 'of='+$(this).parent(".pane").attr('id'));
	});

	$("input.name").typeahead({
		source: ['justin', 'jyrrl', 'obaid', 'david', 'austin', 'aaron', 'liani', 'scott', 'arturo', 'tommy', 'michael', 'eric', 'stephanie', 'josh', 'tunde','misbah']
	});

	$(".name").livequery(function() {
		$(this).typeahead({
			source: ['justin', 'jyrrl', 'obaid', 'david', 'austin', 'aaron', 'liani', 'scott', 'arturo', 'tommy', 'michael', 'eric', 'stephanie', 'josh', 'tunde','misbah']
		});
	});

	$("#chat_input").keydown(function(e){
		if(e.keyCode==13){
			var msg = $(this).val();
			$(this).val('');
			msg = encodeURIComponent(msg);
			console.log(msg);
			$.get('/chat', 'msg='+msg, function(data){

			});	
		}
	});

	$("td").live('keydown', function(e){
		//console.log(e.keyCode);
		var tr = $(this).parents('tr')[0];
		// console.log(tr.rowIndex);
		if(e.keyCode==39){
			var nextCell = $(this).parents('tr')[0].cells[this.cellIndex+1];
			$(nextCell).children()[0].focus();
		}else if(e.keyCode==37){
			var nextCell = $(this).parents('tr')[0].cells[this.cellIndex-1];
			$(nextCell).children()[0].focus();
		}else if(e.keyCode==38){
			var row = $(this).parents('tr')[0];
			var index = this.cellIndex;
			var table = $(row).parents('table')[0].rows[row.rowIndex-1].cells[index];
			$(table).children()[0].focus();
		}else if(e.keyCode==40){
			var row = $(this).parents('tr')[0];
			var index = this.cellIndex;
			var table = $(row).parents('table')[0].rows[row.rowIndex+1].cells[index];
			$(table).children()[0].focus();
		}
	});

	$("input").click(function(){
		var td = $(this).parents('td')[0];
		// console.log(td.cellIndex);
	});
  });













