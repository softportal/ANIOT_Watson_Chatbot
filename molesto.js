// Example 3: maintains state.

var prompt = require('prompt-sync')();
var yaml = require('read-yaml')
var yamlinfo;
var ConversationV1 = require('watson-developer-cloud/conversation/v1');

config = yaml.sync('credentials.yaml')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

console.log(config["Username"])

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
  username: config["Username"], // replace with service username
  password: config["Password"], // replace with service password
  version_date: '2017-05-26'
});

var workspace_id = config["Workspace_ID"]; // replace with workspace ID
var core = new targetData();
// Start conversation with empty message.
conversation.message({
  workspace_id: workspace_id
  }, processResponse);
//Create object to save received user preferences
function targetData(){};
targetData.prototype.set_foodType= function(foodType) { this.foodType=foodType; };
targetData.prototype.set_price= function(price) { this.price=price; };
targetData.prototype.set_location= function(place) { this.place=place; };
targetData.prototype.check_values=function(){
	    return ((this.price != undefined) && (this.place != undefined) && (this.foodType != undefined));
};
targetData.prototype.query=function(){
//{ "price" : "high","foodType":"Chiken","locations":"North"}
  var that = this;
  MongoClient.connect(url, function(err, db) {
  	  if (err) throw err;
  	  var dbo = db.db("test");
          console.log('Recorded price #'+that.price);
          console.log('Recorded food type #'+that.foodType);
          console.log('Recorded place #'+that.place);
  	  var query = { "price" : that.price,"foodType":that.foodType,"locations":that.place};
          var opts = {collation: {locale: "en", strength: 2}}
  	  dbo.collection("restaurants").find(query, opts).toArray(function(err, result) {
  		      if (err) throw err;
  		      console.log(result);
  		      console.log('pene');
  		      db.close();
  		    });
  });

};
// Process the conversation response.
function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }

  // If an intent was detected, log it out to the console.
  if (response.intents.length > 0) {
    console.log('Detected intent: #' + response.intents[0].intent);
  }
  //if a variable..
  if (response.context.hasOwnProperty('targetLocation')){ 
    console.log('Target Location: #' + response.context.targetLocation);
    core.set_location(response.context.targetLocation);
  }
  //i
  if (response.context.hasOwnProperty('targetPrice')){
    console.log('Target Price:#' + response.context.targetPrice);	
    core.set_price(response.context.targetPrice);
  }
  if (response.context.hasOwnProperty('targetFoodType')){
    console.log('Target Food Type:#' + response.context.targetFoodType);
    core.set_foodType(response.context.targetFoodType);
  }
  // Display the output from dialog, if any.
  if (response.output.text.length != 0) {
      console.log(response.output.text[0]);
  }
  if (core.check_values()){
    console.log('FILLED');
    core.query();
  }
  if (!core.check_values()){
	console.log('UNFILLED');
  

  // Prompt for the next round of input.
    var newMessageFromUser = prompt('>> ');
    // Send back the context to maintain state.
    conversation.message({
      workspace_id: workspace_id,
      input: { text: newMessageFromUser },
      context : response.context,
    }, processResponse)
}
}
