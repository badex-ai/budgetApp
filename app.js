//BUDGET CONTROLLER
let budgetController=(function(){
    
    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
    this.percentage= Math.round((this.value / totalIncome) * 100);  }
        else {this.percentage = -1};
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    let Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    let data ={
        
        totals: {
            exp: 0,
            inc: 0,
        },
        allItems:{
            exp:[],
            inc:[]
        },
        budget: 0,
        percentage: -1,
        
       
    };
    
     let calculateTotal = function(type){
        let sum=0;
        data.allItems[type].forEach((cur)=> {
        sum += cur.value;
    });
         data.totals[type]= sum;
    }
     
     
   return { 
       addItem :function(type, des, val){
           let newItem,ID;
           
           //create new ID
           if(data.allItems[type].id>0){
           ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
           }else ID=0;
           
           // create new item 
           if(type === 'exp'){
             newItem = new Expense(ID, des, val);
           }
           else if(type === 'inc') {
               newItem = new Income(ID, des, val)
           }
           
           // push into array of the datastructure
           data.allItems[type].push(newItem);
           return newItem;
       } ,
       
       calculateBudget: function(){

           //calculate total income and expenses
           calculateTotal('exp');
           calculateTotal('inc');
           
           //calculate the budget : income - expenses
         data.budget = data.totals.inc - data.totals.exp  ;
           
           // calculate the percentage of income tahat we spent
           if(data.totals.inc >0 ){
           data.percentage = Math.round((data.totals.exp /data.totals.inc) * 100) ;
       } else data.percentage= -1;
       },
       
       calculatePercentages: function(){
           data.allItems.exp.forEach( current => {current.calcPercentage(data.totals.inc)})
       },
       
       
         getPercentages:function(){ 
          let allPerc =  data.allItems.exp.map( 
              current =>{ 
                  return current.getPercentage()});
             return allPerc
         },
    
       getBudget: function(){
           return {
               budget: data.budget,
               totalIncome: data.totals.inc,
               totalExpenses: data.totals.exp,
               percentage: data.percentage
               
           }
       },
       
        deleteItem: function(type, id){
           let ids, index;
            
            ids=  data.allItems[type].map(function(current){return current.id});
       index= ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
   }
}})();


//UI CONTROLLER 
let UIController = (function(){
    var DOMstrings={
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeList: '.income__list',
        expensesList: '.expenses__list',
        addContainer: '.item__container',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        dateLabel:'.budget__title--month'
    };
    
    let nodeListForEach = function(list, callback){
                    for(var i= 0; i< list.length; i++){
                        callback(list[i],i)
                    }
                };
     let formatInput = function(num,type){
            let numSplit,int,dec;
//            + and - before the digit depending on type
//            to 2 decimal places
//            comma before the thousand and million mark
            
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit= num.split('.');
            int= numSplit[0];
            if(int.length > 3){
                int = int.substr(0,int.length-3) + "," + int.substr(int.length-3,3)
            };
            dec= numSplit[1];
            
           ;
          return (type === 'exp' ? "-" : "+" )+ ' ' + int + '.' + dec 
        };
    
    return {
        getInput: function(){return {
             type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
             description: document.querySelector(DOMstrings.inputDescription).value,
             value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        
    }},
        
        getDOMstrings: function(){
            return DOMstrings
        },
        
        addListItem: function(obj,type){
            let html,newhtml,element;
            
            
            
             if(type==='inc'){ 
                
                element=DOMstrings.incomeList;
                
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                }
            
                
             else if(type==='exp'){
                 element= DOMstrings.expensesList;
                 
                 html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'}
                 
                
            
            
            
            //replace the placeholder text with some actual data
          newhtml = html.replace('%id%', obj.id);
           newhtml = newhtml.replace('%description%', obj.description);
           newhtml = newhtml.replace('%value%', formatInput(obj.value,type));
            
            //insert the income/expenxe into the UI
            console.log(document.querySelector(element));
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml)
        },
        
        
        clearFields: function(){
            let fields,fieldsArr;
             fields = document.querySelectorAll(DOMstrings.inputDescription +', ' + DOMstrings.inputValue);
            fieldsArr = Array.from(fields);
            fieldsArr.forEach((current,index,array) => {current.value=""});
            fieldsArr[0].focus();
        },

        
        displayBudget: function(obj){
            let type;
            obj.budget < 0 ? type = "exp": type = "inc" ;
            document.querySelector(DOMstrings.budgetLabel).textContent= formatInput(obj.budget, type );
            document.querySelector(DOMstrings.incomeLabel).textContent= formatInput(obj.totalIncome,"inc");
            document.querySelector(DOMstrings.expenseLabel).textContent= formatInput(obj.totalExpenses,"exp");
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else document.querySelector(DOMstrings.percentageLabel).textContent= '---'
            
            
        },
        
        
        deleteListItem: function(selectorID){
            let el=document.getElementById(selectorID);
            el.parentNode.removeChild(el)
        },
        
        
        displayPercentages: function(percentages){
            let fields;
             fields = document.querySelectorAll(DOMstrings.itemPercentage);
//             console.log(fields);
//            let each= Array.from(fields);
//            console.log(each);
//            for(let i=0; i< each.length; i++ ){each[i].textContent=percentages[i]+ '%'}
                nodeListForEach(fields, function(curr,index ){
                if(percentages[index] > 0){ curr.textContent = percentages[index] + '%'}
                else {curr.textcontent = '---'}
               
            });
            
            },
        displayMonth: function(){
            let now,year,month,months;
            now = new Date();
            month= now.getMonth();
            months=["January","Febraury","March","April","May","June","July","August","September","October","November","December"];
            year = now.getFullYear(); 
            document.querySelector(DOMstrings.dateLabel).textContent= months[month] + ", " + year
        },
        changedType: function(){
            let fields;
            fields = document.querySelectorAll(
                DOMstrings.inputType + ','  +
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);
            nodeListForEach(fields,function(curr){
                curr.classList.toggle('red-focus');
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
            } )
        }
      
       
        }
        
        
         
            
})();


//GLOBAL APP CONTROLLER
let controller=(function(UICtrl, budgetCtrl){
    
    let setUpEventListeners = function (){
         let DOM = UICtrl.getDOMstrings();
        
         document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem );
    
         document.addEventListener('keypress', function(event){
            if (event.keycode === 13|| event.which === 13){
            ctrlAddItem();
       } ;
    });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType)
        
    }
    
    let updateBudget = function(){
        //calculate the budget
        budgetCtrl.calculateBudget();
        
        //return the budget
       let budget= budgetCtrl.getBudget();
        console.log(budget)
        //display the budget on the UI
        UICtrl.displayBudget(budget);
        
    } ;
    
    let updatePercentages= function(){
        //calculate percentages 
     budgetCtrl.calculatePercentages()
        
        //read percentages from the budgetController
       var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
       
        //update the percentages to the UI 
       UICtrl.displayPercentages(percentages);
    }
    
    
    let ctrlAddItem = function(){
        let input,newInput,addList;
        //get the field input data
        input = UICtrl.getInput();
        
        if(input.description !=='' && !isNaN(input.value) && input.value > 0){
           
           
           // add the item to the budget controller
         newInput = budgetCtrl.addItem(input.type, input.description, input.value);
        
        //add the new item to the UI
         addList = UICtrl.addListItem(newInput,input.type);
        
        //clear the fields
        UICtrl.clearFields();
        
        
        
        //calc and update budget
         updateBudget();
            
        //update the percentage
            updatePercentages();
            
           }
                

    };
    
    let ctrlDeleteItem = function(event){
        let itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            
             //      remove the item from the Data
                budgetCtrl.deleteItem(type,ID);
            //      remove the item from the UI
                UICtrl.deleteListItem(itemID);
            //      update the budget
                 updateBudget();
        }
  
        
    };
    
    
   
    return {
        getInit:function(){
            console.log('Application started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
               budget:0,
               totalIncome: 0,
               totalExpenses: 0,
               percentage: 0,
               
           }) 
            setUpEventListeners()
        }
    } 
})(UIController, budgetController)

controller.getInit();