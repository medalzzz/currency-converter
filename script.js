const left_currency = $("#left_currency")[0];
const left_amount = $("#left_amount")[0];
const left_currency_text = $("#left_currency_text")[0];

const right_currency = $("#right_currency")[0];
const right_amount = $("#right_amount")[0];
const right_currency_text = $("#right_currency_text")[0];


$(document).ready(async function(){ //waits for html to load
   right_amount.value = await getConvertion(left_currency.value, right_currency.value, left_amount.value); //calls convertion right away so it wont leave blank inputs
   
   $(".currency_selector").change(async function(){ //when changing currencies
      blockDuplicates();

      if(this.id == "left_currency"){
         left_amount.value = await getConvertion(right_currency.value, left_currency.value, right_amount.value);
         changeCoinSymbol(left_currency.value, left_currency_text);
      }
      else{
         right_amount.value = await getConvertion(left_currency.value, right_currency.value, left_amount.value);
         changeCoinSymbol(right_currency.value, right_currency_text);
      }
   });

   //when swap button is clicked
   $("#swap_currencies").click( () => { 
      swapCurrencies();
      changeCoinSymbol(left_currency.value, left_currency_text);
      changeCoinSymbol(right_currency.value, right_currency_text);
   });

   //when a new input is entered
   $(".currency").keyup(async function(e){
      this.value = numberFormat(this);

      //prevents request if key pressed was: not numeric, comma, dot, not backspace and input value isnt empty
      if(/[^\d.,]/gi.test(e.originalEvent.key) && e.originalEvent.key != "Backspace" && $(this).val() != "") return;

      if(this.id == "left_amount") 
         right_amount.value = await getConvertion(left_currency.value, right_currency.value, left_amount.value);
      else 
         left_amount.value = await getConvertion(right_currency.value, left_currency.value, right_amount.value);
   });
});


//converts and calculates currency, then returns amount in selected element
async function getConvertion(converted_from, converted_to, amount){
   try{
      const response = await axios.get(`https://economia.awesomeapi.com.br/last/${converted_from}-${converted_to}`)
      const args = converted_from + converted_to; //merging both currencies to var, to access response json attribute
      
      let convertion = amount.replaceAll(",", ".") * response.data[args].bid; //truncates converted amount to 2 decimals without rounding
      convertion = convertion.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0].replaceAll(".", ",");
      return convertion;
   }
   catch(err){
      console.log(`Failed request error: ${err}`);
      return "0";
   }
}

//swaps currencies and amounts
function swapCurrencies(){
   const temp_var = right_currency.value;
   const temp_var2 = right_amount.value;

   $("#right_currency").find(".hidden").removeClass("hidden"); //add back hidden currency option
   $("#right_currency > option:selected").addClass("hidden"); //remove currency selected on the left side
   $("#right_currency").val( $("#left_currency").val() ); //set right side currency
   $("#right_amount").val( $("#left_amount").val() ); //set right side amount

   $("#left_currency").find(".hidden").removeClass("hidden"); //add back hidden currency option
   $("#left_currency > option:selected").addClass("hidden"); //remove currency selected on the right side
   $("#left_currency").val(temp_var); //set left side currency
   $("#left_amount").val( temp_var2 ); //set left side amount
}

//formats designated input field
function numberFormat(element){
   let number = element.value.replaceAll(".", ",").replaceAll(/[^0-9,]/g, ''); //gets element value, replaces dots with commas and any non numeric char except for comma

   //loops through string and counts number of commas in it
   let dot_count = 0;
   for(i=0; i<=number.length; i++){
      if(number[i] == ',') 
         dot_count++;
   }
   
   //removes first iteration of dot in string, so the number cant have multiple commas
   if(number.includes(',') && dot_count>1) 
      number = number.replace(',', '');

   return number; //returns formatted number
}

//changes symbol next to input fields to match selected currency
function changeCoinSymbol(currency, target){
   switch(currency){
      case "USD":
         $(target).text("$");
         break;
      
      case "BRL":
         $(target).text("R$");
         break;

      case "EUR":
         $(target).text("€");
         break;
   }
}

//prevents duplicates currencies from showing up in select fields
function blockDuplicates(){
   const left_select_val = left_currency.value;
   const right_select_val = right_currency.value;

   $("#left_currency option").removeClass("hidden");
   $(`#left_currency option[value='${right_select_val}']`).addClass("hidden");

   $("#right_currency option").removeClass("hidden");
   $(`#right_currency option[value='${left_select_val}']`).addClass("hidden");
}