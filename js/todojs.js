$(function(){
	var seppi = {}
	seppi.init = {}
	seppi.init.db = {}

	seppi.init.open = function(){
		seppi.init.db = openDatabase("seppi","1.0","MyFirstWebDatabase",5*1024);
	}
	seppi.init.createTable = function(){
		var database = seppi.init.db;
		database.transaction(function(tx){
			tx.executeSql("CREATE TABLE IF NOT EXISTS todo (ID INTEGER PRIMARY KEY ASC, todo_item TEXT, due_date VARCHAR)", []);
		});
	}

	seppi.init.addTodo = function(todoItem, dueDate){
		var database = seppi.init.db;
		database.transaction(function(tx){
			tx.executeSql("INSERT INTO todo (todo_item, due_date) VALUES (?,?)", [todoItem, dueDate]);
		});
		showAllTodo(todoItem, dueDate, 1);
	}

	seppi.init.deleteTodo = function(todoID){
		var database = seppi.init.db;
		database.transaction(function(tx){
			tx.executeSql("DELETE FROM todo WHERE ID=?",[todoID]);
		});
	}

	seppi.init.updateTodoTask = function(todoID, newText){
		var database = seppi.init.db;
		database.transaction(function(tx){
			tx.executeSql("UPDATE todo SET todo_item=? WHERE ID=?", [newText, todoID]);
		});
	}

	seppi.init.updateTodoDate = function(todoID, newDate){
		var database = seppi.init.db;
		database.transaction(function(tx){
			tx.executeSql("UPDATE todo SET due_date=? WHERE ID=?", [newDate, todoID]);
		});
	}

	function showAllTodo(todo_item_text, todo_due_date, only_last_li_flag, todo_id){
		var today = new Date();
		var tododate = new Date(todo_due_date);

		var daysbetween = Math.abs(today.getTime() - tododate.getTime())/(1000 * 60 * 60 * 24);
		console.log(daysbetween);

		if(daysbetween<8){
			$('#week_list').append('<li>' +
									'<div class="todo_item">' +
										'<span class="todo_text">' + todo_item_text + '</span>' +
										'<input type="text" class="edit_todo_text" style="display: none"/>' +
										'<input type="checkbox" class="todo_check" href="#" id="delete">' +
										'<span class="due_date">' + todo_due_date + '</span>' + 
										'<input type="text" class="edit_todo_date due_date" style="display: none"/>' +
										'<input type="hidden" id="this_id" value="' + todo_id + 
										'">' + 
										'<div class="clear"></div>' +
									'</div>' +
								'</li>');
			//$('li:last').effect( "bounce", "slow" );
			if(only_last_li_flag)
				$('#week_list li:last').effect( "bounce", "slow" );
		}
		if(daysbetween<32 && daysbetween>=8){
			$('#month_list').append('<li>' +
									'<div class="todo_item">' +
										'<span class="todo_text">' + todo_item_text + '</span>' +
										'<input type="text" class="edit_todo_text" style="display: none"/>' + 
										'<input type="checkbox" class="todo_check" href="#" id="delete"/>' +
										'<span class="due_date">' + todo_due_date + '</span>' + 
										'<input type="text" class="edit_todo_date due_date" style="display: none"/>' +
										'<input type="hidden" id="this_id" value="' + todo_id + 
										'">' + 
									'<div class="clear"></div>' +
									'</div>' +
								'</li>');
			//$('li:last').effect( "bounce", "slow" );
			if(only_last_li_flag)
				$('#month_list li:last').effect( "bounce", "slow" );
		}
		
	}

	seppi.init.getTodo = function(){
		var database = seppi.init.db;
		var output = '';
		database.transaction(function(tx){
			tx.executeSql("SELECT * FROM todo ORDER BY due_date ASC", [], function(tx, result){
				for(var i=0; i<result.rows.length; i++){
					todo_item=result.rows.item(i).todo_item;
					todo_due_date=result.rows.item(i).due_date;
					todo_id=result.rows.item(i).ID;

					showAllTodo(todo_item, todo_due_date, 0, todo_id);
				}
				$('#week_list').effect( "bounce", "slow" );
				$('#month_list').effect( "bounce", "slow" );
			});
		});
	}

	$('#create_todo').click(function(){
		var todo_item_text = $('#todo_item_text').val();
		var todo_due_date = $('#todo_due_date').val();

		if(todo_item_text.length == '' || todo_due_date.length == ''){
			alert("Both fields are required");
		}
		else{
			seppi.init.addTodo(todo_item_text, todo_due_date);
			$('#todo_item_text').val('');
			$('#todo_due_date').val('');
		}
	});

	$('#finished_todo').click(function(){
		var todo_ids = [];
		$('input[type=checkbox]').each(function () {
			if(this.checked){
    			todo_ids.push($(this).closest('li').find('#this_id').val()); 
    			$(this).closest('li').remove();
			}
		});

		for(var i=0; i<todo_ids.length; i++){
			seppi.init.deleteTodo(todo_ids[i]);
		}
	});

	$('#todo_due_date').datepicker();

	function init(){
		if(typeof(openDatabase) !== undefined){
			seppi.init.open();
			seppi.init.createTable();
			seppi.init.getTodo();
		}
		else{
			('#bodyWrapper').html('<h2 class="error_message"> Your browser does not support WebSQL! </h2>');
		}
		// if(typeof(Storage) !== "undefined") {
	 //        if (localStorage.todopersonalname) {
	 //            localStorage.todopersonalname = Number(localStorage.clickcount)+1;
	 //        } else {
	 //            localStorage.clickcount = 1;
	 //        }
	 //        //document.getElementById("result").innerHTML = "You have clicked the button " + localStorage.clickcount + " time(s).";
	 //    } else {
	 //        //document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
	 //    }
	}

	//Editing the todo Task
	$('#week_list').on('click', 'li .todo_text', function(){
		$(this).hide().siblings(".edit_todo_text").show().val($(this).text()).focus();
	});
	$('#week_list').on('focusout', '.edit_todo_text', function(){
	    var record_id = $(this).siblings("#this_id").val();
	    $(this).hide().siblings(".todo_text").show().text($(this).val());
		seppi.init.updateTodoTask(record_id, $(this).val());
	});
	$('#month_list').on('click', 'li .todo_text', function(){
		$(this).hide().siblings(".edit_todo_text").show().val($(this).text()).focus();
	});
	$('#month_list').on('focusout', '.edit_todo_text', function(){
	    var record_id = $(this).siblings("#this_id").val();
	    $(this).hide().siblings(".todo_text").show().text($(this).val());
		seppi.init.updateTodoTask(record_id, $(this).val());
	});


	//Editing the todo Date
	$('#week_list').on('click', 'li .due_date', function(){
		$(this).hide().siblings(".edit_todo_date").show().val($(this).text()).focus();
	});
	$('#week_list').on('focusout', '.edit_todo_date', function(){
	    var record_id = $(this).siblings("#this_id").val();
	    $(this).hide().siblings(".due_date").show().text($(this).val());
		seppi.init.updateTodoDate(record_id, $(this).val());
	});
	$('#month_list').on('click', 'li .due_date', function(){
		$(this).hide().siblings(".edit_todo_date").show().val($(this).text()).focus();
	});
	$('#month_list').on('focusout', '.edit_todo_date', function(){
	    var record_id = $(this).siblings("#this_id").val();
	    $(this).hide().siblings(".due_date").show().text($(this).val());
		seppi.init.updateTodoDate(record_id, $(this).val());
	});

	//Strikethrough on checkbox
	$('#week_list').on('change', 'li .todo_check', function(){
		// this will contain a reference to the checkbox   
	    if (this.checked) {
	        // the checkbox is now checked 
	        $(this).closest('li').find('.todo_text').addClass('strike');
	        $(this).closest('li').find('.due_date').addClass('strike');
	    } else {
	        // the checkbox is now no longer checked
	        $(this).closest('li').find('.todo_text').removeClass('strike');
	        $(this).closest('li').find('.due_date').removeClass('strike');
	    }
	});
	$('#month_list').on('change', 'li .todo_check', function(){
		// this will contain a reference to the checkbox   
	    if (this.checked) {
	        // the checkbox is now checked 
	        $(this).closest('li').find('.todo_text').addClass('strike');
	        $(this).closest('li').find('.due_date').addClass('strike');
	    } else {
	        // the checkbox is now no longer checked
	        $(this).closest('li').find('.todo_text').removeClass('strike');
	        $(this).closest('li').find('.due_date').removeClass('strike');
	    }
	});

	init();

});