var App = new function() {}

App.Settings = new function() {

	this.save = function()
	{
		// do check if valid, save... go back if success, alert error if username/password/network failure.
		history.go(-1);
	}

}

App.latestTransactionID = false;
App.playNotice = false;
App.notice = new Media('/android_asset/www/notice.wav');

App.refresh = function()
{

	setTimeout(function()
	{

		$.post('http://sandbox.openbroadcaster.com/api.php',{'c': 'ebusker_mobile', 'a': 'artist_latest_transaction', 'd': false}, function(response)
		{

			var transaction = response.data;

			if(transaction.transaction_id != App.latestTransactionID)
			{

				if(App.playNotice) App.notice.play();
				$('#total_balance').text('$'+transaction.balance);
				$('#notice').html(transaction.description);
	
				App.latestTransactionID = transaction.transaction_id;

			}

			App.refresh();

		},'json');
		

	}, 2500);

}

App.init = function()
{
	$.mobile.allowCrossDomainPages = true;

	// only play notice if there is a real device (as opposed to a web browser).
	if(typeof(device)!='undefined') App.playNotice = true;

	$.post('http://sandbox.openbroadcaster.com/api.php',{'c': 'ebusker_mobile', 'a': 'artist_latest_transaction', 'd': false}, function(response)
	{

		if(App.playNotice) App.notice.play();
		var transaction = response.data;
		$('#total_balance').text('$'+transaction.balance);
		App.latestTransactionID = transaction.transaction_id;

		App.refresh();

	},'json');

}

$(document).ready(function() {
	if(navigator.userAgent.indexOf('Chrome')>-1 || navigator.userAgent.indexOf('Firefox')>-1) App.init();
});

