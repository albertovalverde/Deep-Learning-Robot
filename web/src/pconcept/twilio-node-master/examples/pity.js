//require the Twilio module and create a REST client
var client = require('../lib')('AC2815564b118b8d4d248f5145dcc4bffe', 'dfc343ad74ace899670b5b7684e932aa');



//Send an text message
client.sendMessage({

    to: '+34608837254', // Any number Twilio can deliver to
    from: '+12242670057', // A number you bought from Twilio and can use for outbound communication
    body: 'Hello from Pity.' // body of the SMS message
	

}, function(err, responseData) { //this function is executed when a response is received from Twilio

    if (!err) { // "err" is an error received during the request, if any

        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "word to your mother."

    }

});

//Send a message with content (MMS)
client.messages.post({

    to: '+34608837254', // Any number Twilio can deliver to
    from: '+12242670057', // A number you bought from Twilio and can use for outbound communication
    body: 'Kind sir, won\'t you instruct me how to douglas?',
    mediaUrl: 'https://www.planwallpaper.com/static/images/9-credit-1.jpg'

}, function (err, responseData) {

    console.log(responseData);

});

//Place a phone call, and respond with TwiML instructions from the given URL
//client.makeCall({

 //   to: '+16515556677', // Any number Twilio can call
 //   from: '+14506667788', // A number you bought from Twilio and can use for outbound communication
 //   url: 'http://www.example.com/twiml.php' // A URL that produces an XML document (TwiML) which contains instructions for the call

//}, function(err, responseData) {

    //executed when the call has been initiated.
  //  console.log(responseData.from); // outputs "+14506667788"

//});
