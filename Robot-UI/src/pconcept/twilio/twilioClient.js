var config = require('./config');
var client = require('twilio')(config.accountSid, config.authToken);

module.exports.sendSms = function(to, message) {
  client.messages.create({
    body: message,
    to: to,
    from: config.sendingNumber,
 // mediaUrl: imageUrl
 mediaUrl: 'https://s-media-cache-ak0.pinimg.com/736x/64/33/96/64339626772fabbe318761ef151d178f.jpg'
  }, function(err, data) {
    if (err) {
      console.error('Could not notify administrator');
      console.error(err);
    } else {
      console.log('Administrator notified');
    }
  });
};
