/*==================================================
	BUDGETY APP
====================================================*/

var budgetController=(function(){
	//COSTRUTTORI
	var Expense=function(id,desc,value){
		this.id=id;
		this.desc=desc;
		this.value=value;
		this.percentage=-1;
	}

	Expense.prototype.calcPercentage=function(tIncome){
		if(tIncome>0)
			this.percentage=Math.round((this.value/tIncome)*100);
		else this.percentage= -1;
	};

	Expense.prototype.getPercentage=function(){
		return this.percentage;
	};

	var Income=function(id,desc,value){
		this.id=id;
		this.desc=desc;
		this.value=value;
	}

	function calcTotal(type){
		var s = 0;

		data.items[type].forEach(function(elm){
			s+=elm.value;
		});

		data.totals[type]=s;
	}

	var data={
		items:{
			exp:Array(),
			inc:Array()
		},
		totals:{
			exp:0,
			inc:0
		},
		budget:0,
		percentage: -1
	};
	
	return {
		addItem:function(type, desc,val){
			var newItem,ID;
			
			//per generare l'id vado a recuperare l'ultimo id
			var length=data.items[type].length;
			
			if(length>0)
				ID=data.items[type][length-1].id+1;
			else
				ID=0;

			//Creazione nuovo oggetto
			if(type==='exp')
				newItem = new Expense(ID,desc,val);
			else if(type==='inc')
				newItem = new Income(ID,desc,val);

			//aggiornamento dati 
			data.items[type].push(newItem);

			//restituisco oggetto creato
			return newItem;
		},

		deleteItem:function(type,id){
			var ids,index;

			ids=data.items[type].map(function(current){
				return current.id;
			});

			index=ids.indexOf(id);

			if(index !== -1){
				data.items[type].splice(index,1);
			}
		},
		
		consoleTest:function(){
			console.log(data);
		},
		
		calcBudget:function(){
			//1. calcolo le entrate e spese totali
			calcTotal('exp');
			calcTotal('inc');

			//2. calcolo il budget: entrate - spese
			data.budget=data.totals.inc - data.totals.exp;

			//3.calcolo percentuale dell'entrate spese
			if(data.totals.inc>0)
				data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
			else data.percentage=-1;
		},

		calcPercentages:function(){
			data.items.exp.forEach(function(current){
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages:function(){
			var allPercentages=data.items.exp.map(function(current){
				return current.getPercentage();
			});

			return allPercentages;
		},

		getBudget:function(){
			return{
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		}
	};
})();

/*======================================================
	USER INTERFACE
========================================================*/

var UIController=(function(){
	//Object contente gli elementi html
	var domStrings={
		//Inputs
		inputType:'.add__type',
		inputDesc:'.add__description',
		inputValue:'.add__value',
		//Buttons
		add_btn:'.add__btn',
		//Containers
		container:'.container',
		incomeContainer:'.income__list',
		expensesContainer:'.expenses__list',
		//Labels
		budgetLabel:'.budget__value',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		elPercentageLabel:'.item__percentage',
		dateLabel:'.budget__title--month'

	}

	function formatNumber(type,num){
			var numSplit,int,dec,sign;
			/*
				+/- prima del numero
				2 cifre decimali
				punto per separare i mille

				250,342 -> 250,34
				1240,436 -> 1.240,44
			*/

			num = Math.abs(num);//rendo il numero assoluto (senza segno)
			num = num.toFixed(2);//riduce a 2 cifre decimali la parte decimale.

			numSplit=num.split('.');

			int=numSplit[0];

			if(int.length>3)
			{
				int=int.substr(0,int.length-3)+'.'+int.substr(int.length-3,3);
			}

			dec=numSplit[1];

			;

			return (type==='exp' ? sign='-' : sign='+')+' '+int+','+dec;
		}

		function nodeListForEach(list, callback){
			for(var i=0;i<list.length;i++)
			{
				callback(list[i],i);
			}
		}
	//Public stuff
	return {
		getInput: function(){
			return {
				type: document.querySelector(domStrings.inputType).value,
				description: document.querySelector(domStrings.inputDesc).value,
				value:parseFloat(document.querySelector(domStrings.inputValue).value)
			};
		},//func
		
		getDomStrings:function(){
			return domStrings;
		},
		
		addListItem:function(obj,type){
			var html,newHtml,element;

			//1.Creo html con placeholder text

			if(type==='inc')
			{
				//Income
				element= domStrings.incomeContainer;
				html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type==='exp'){
				//Expense
				element= domStrings.expensesContainer;
				html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//2.sostituisco i placeholder con i dati attuali
			newHtml= html.replace('%id%',obj.id);
			newHtml= newHtml.replace('%description%',obj.desc);
			newHtml= newHtml.replace('%value%',formatNumber(type,obj.value));

			//3.Inserisco html nel DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
		},

		deleteListItem:function(selectorID){
			var el=document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields:function(){
			var fields;
			
			fields=document.querySelectorAll(domStrings.inputDesc+','+domStrings.inputValue);

			var fieldsArr=Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function(currentElement,index, array){
				currentElement.value="";
			});

			fieldsArr[0].focus();
		},

		displayBudget:function(obj){
			var type;
			
			obj.budget >= 0 ? type='inc' : type='exp';

			document.querySelector(domStrings.budgetLabel).textContent=formatNumber(type,obj.budget);
			document.querySelector(domStrings.incomeLabel).textContent=formatNumber('inc',obj.totalInc);
			document.querySelector(domStrings.expensesLabel).textContent=formatNumber('exp',obj.totalExp);

			if(obj.percentage>0)
				document.querySelector(domStrings.percentageLabel).textContent=obj.percentage+'%';
			else
				document.querySelector(domStrings.percentageLabel).textContent='===';
		},

		displayPercentages:function(percs){

			var fields=document.querySelectorAll(domStrings.elPercentageLabel);
			
			nodeListForEach(fields,function(current,index){

				if(percs[index]>0)
					current.textContent=percs[index]+'%';
				else current.textContent='===';
			});
		},

		displayMonth: function(){
			var dateOfToday,year,month;
			var months=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];


			dateOfToday=new Date();
			year= dateOfToday.getFullYear();
			month= dateOfToday.getMonth();
			document.querySelector(domStrings.dateLabel).textContent=months[month]+' '+year;

		},

		setType:function(type){
			document.querySelector(domStrings.inputType).value=type;
		},

		changedType:function(){
			var fields;

			fields=document.querySelectorAll(
				domStrings.inputType+','+
				domStrings.inputDesc+','+
				domStrings.inputValue);

			nodeListForEach(fields,function(current){
				current.classList.toggle('red-focus');
			});

			document.querySelector(domStrings.add_btn).classList.toggle('red');

		}
	};//return

})();

/*======================================================
	GLOBAL APP
========================================================*/

var controller=(function(budgetCtrl,UICtrl){

	function setupEventListerners(){
		var domStrings=UICtrl.getDomStrings();

		var add_btn=document.querySelector(domStrings.add_btn);

		/*BUTTON EVENTS*/
		add_btn.addEventListener('click',ctrlAddItem);
		
		//DOCUMENT EVENTS
		document.addEventListener('keypress',function(event){

			if(event.keyCode===13 || event.which===13)
				ctrlAddItem();
			else if(event.keyCode===43 || event.which===43)//+ key pressed
				//set the type menu to inc
				UICtrl.setType('inc');
			else if(event.keyCode===45 || event.which===45)
				//set the type menu to exp
				UICtrl.setType('exp');

		});

		//Delete button
		document.querySelector(domStrings.container).addEventListener('click',ctrlDeleteItem);
		
		document.querySelector(domStrings.inputType).addEventListener('change',UICtrl.changedType);
	}

	function updateBudget(){
		//1.Calcolo il budget
		budgetCtrl.calcBudget();
		
		//2.ritorno il buget
		var budget=budgetCtrl.getBudget();

		//3.Visualizzo il budget nella UI
		UICtrl.displayBudget(budget);
	}

	function updatePercentages(){
		//1. Calcolo percentuale
		budgetCtrl.calcPercentages();

		//2. Leggo percentuale dal budgetCTRL
		var perc=budgetCtrl.getPercentages();

		//3. Aggiorno l'UI con le percentuali
		UICtrl.displayPercentages(perc);
	}


	function ctrlAddItem(){
	var input,item;

		//1. Recupero i dati inseriti
		input=UICtrl.getInput();
		
		if(input.description !== "" && !isNaN(input.value) && input.value>0){
			//2.Inserisco l'elemento nel budget controller
			item=budgetCtrl.addItem(input.type,input.description,input.value);

			//3.Inserisco l'oggetto nella UI
			UICtrl.addListItem(item,input.type);
			
			//4.clear fields
			UICtrl.clearFields();

			//5.Calcolo e aggiorno il budget totale
			updateBudget();

			//6.Calcolo e aggiorno le percentuali
			updatePercentages();
		}
	}

	function ctrlDeleteItem(event){
		var itemID,splitID,type,id;

		itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemID)
		{
			splitID=itemID.split('-');
			type=splitID[0];
			id=parseInt(splitID[1]);

			//1.cancello elemento dalla struttura dati
			budgetCtrl.deleteItem(type,id);

			//2.Cancello elemento dalla ui
			UICtrl.deleteListItem(itemID);

			//3.Aggiorno e visualizzo il budget aggiornato
			updateBudget();

			//6.Calcolo e aggiorno le percentuali
			updatePercentages();
		}
	}

	return {
		init: function(){
			var initBudget={budget:0,totalInc:0,totalExp:0,percentage:-1}


			UICtrl.displayMonth();
			UICtrl.displayBudget(initBudget);
			setupEventListerners();
		}

	};

	
})(budgetController,UIController);

/*Application starts*/
controller.init();