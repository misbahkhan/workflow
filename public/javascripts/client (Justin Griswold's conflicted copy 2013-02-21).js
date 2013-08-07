  var socket = io.connect('/');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

  var user; 

  $(window).load(function(){
  	if(window.location.hash){
  		$($("ul.nav>li.active>a").attr('href')).removeClass("show");
		$("ul.nav>li.active").removeClass("active");
		$('a[href$="'+window.location.hash+'"]').parent("li").addClass("active");
		$(window.location.hash).addClass('show');
  	}

  	$("body").keydown(function(e){
  		if(e.keyCode==27){
  			$("body").fadeOut();
  			window.location = '/logout';
  		}else if(e.keyCode==9){
  			e.preventDefault();
  			$("#key").show();
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
						$("#name").val('').show().css("display","block").focus().select();
					}
				});				
			}
		}
	});

	$('.a-nav').click(function(e){
		$($("ul.nav>li.active>a").attr('href')).removeClass("show");
		$("ul.nav>li.active").removeClass("active");
		$(this).parent("li").addClass("active");
		$($(this).attr('href')).addClass('show');
	});

	var update = function(of, id, property, value){
		$.get('/update', 'of='+of+'&id='+id+'&property='+property+'&value='+value, function(data){
			if(data=='t'){
				console.log('pass');
				$("tr#"+id).addClass("success");
				setTimeout(function () {
    				$("tr#"+id).removeClass("success");
				}, 1000);
			}else{
				console.log('fail');
				$("tr#"+id).addClass("error");
				setTimeout(function () {
    				$("tr#"+id).removeClass("error");
				}, 1000);
			}
		});	
	}

	$(".edit").live('keydown', function(e){
		if(e.keyCode==13){
			e.preventDefault();
			if($(this).text().trim()!=""){
				var value = $(this).text().trim();
				var property = $(this).closest('table')[0].rows[0].cells[$(this).parent()[0].cellIndex].innerHTML;
				var id = $(this).parents('tr').attr('id');
				var of = $(this).parents('.pane').attr('id');
				update(of, id, property, value);
				$(this).blur();
		 	}else{
		 		$(this).blur();
		 	}
		}
	});

  });













