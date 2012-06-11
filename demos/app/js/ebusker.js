var App = new function() {}

App.Settings = new function() {

	this.save = function()
	{
	
		// do check if valid, save... go back if success, alert error if username/password/network failure.

		history.go(-1);

	}

}

App.NowPlaying = new function() {

	this.ajaxRunning = false;
	this.data = false;
	this.tickId = false;

	this.timePad = function(val)
	{
		while(val.toString().length<2) val = '0'+val;
		return val;
	}

	this.timeFormat = function(d)
	{
		d = Number(d);
		d = Math.round(d/1000);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);

		seph = 'h';
		sepm = 'm';
		seps = 's';

		var v = '';
		
		if(h>0) { m = App.NowPlaying.timePad(m); v = v+h+seph; }
		if(m>0) { s = App.NowPlaying.timePad(s); v = v+m+sepm; }
		v = v+s+seps;

		return v;
	}

	this.tick = function()
	{

		// make sure we're not already processing an ajax request.
		if(App.NowPlaying.ajaxRunning) { return; }

		var now = new Date().getTime();

		// if we need to update, make our update
		if(!App.NowPlaying.data || now>=App.NowPlaying.data.show_end || now>=App.NowPlaying.data.track_end)
		{

			var vars = new Object();
	
			vars.c = 'ebusker_mobile';
			vars.a = 'now_playing';
			vars.d = '{"device_id": 40}';

			$.post('http://sandbox.openbroadcaster.com/api.php',vars,function(response)
			{

				App.NowPlaying.data = response.data;
				App.NowPlaying.data.show_end = new Date().getTime() + response.data.show_time_left*1000;
				App.NowPlaying.data.track_end = new Date().getTime() + response.data.media.time_left*1000;

				if(response.data.show_time_left < -10 || response.data.media.time_left < -10) 
				{
					clearInterval(App.NowPlaying.tickId);
					$('#now_playing').replaceWith('<div id="now_playing" class="error">An error occurred while trying to determine what\'s playing.  Perhaps nothing is playing.</p>');
					// now_playing_center();
					return;
				}
			
				$('#now_playing_show_countdown').text('time loading...');
				$('#now_playing_track_countdown').text('time loading...');

				$('#now_playing_show_name').text(App.NowPlaying.data.show_name);
				$('#now_playing_track_name').text(App.NowPlaying.data.media.title);
				$('#now_playing_artist_name').text(App.NowPlaying.data.media.artist);

				$('#now_playing_show_countdown').text(App.NowPlaying.timeFormat(App.NowPlaying.data.show_end - now));
				$('#now_playing_track_countdown').text(App.NowPlaying.timeFormat(App.NowPlaying.data.track_end - now));

				if(App.NowPlaying.data.media.ebusker_artist) $('#now_playing_ebusk').show();
				else $('#now_playing_ebusk').hide();
	
			},'json');

			return;

		}

		// no update required or pending, so just tick the countdowns.
		$('#now_playing_show_countdown').text(App.NowPlaying.timeFormat(App.NowPlaying.data.show_end - now));
		$('#now_playing_track_countdown').text(App.NowPlaying.timeFormat(App.NowPlaying.data.track_end - now));

	}

}

App.notice = new Media('/android_asset/www/notice.wav');

App.Transaction = new function()
{

	this.transactionTotal = 0.00;

	this.init = function()
	{

		this.artist = App.NowPlaying.data.media.ebusker_artist;
		if(!this.artist) return false;

		$.mobile.changePage('#transaction');

		$('#transaction_artist').text(this.artist.name);
		$('#transaction_comments').val('');

		this.transactionTotal = 0;
		this.updateAmount();

	}

	this.increaseAmount = function(amount)
	{
		this.transactionTotal += amount;
		this.transactionTotal = Math.round(this.transactionTotal*100)/100;
		if(this.transactionTotal>2) this.transactionTotal=2;
		this.updateAmount();
	}

	this.resetAmount = function()
	{
		this.transactionTotal = 0;
		this.updateAmount();
	}

	this.updateAmount = function()
	{
		$('#transaction_total').text(this.transactionTotal.toFixed(2));
	}

	this.send = function()
	{

		if(this.transactionTotal==0) 
		{
			alert('Transaction total must be greater than $0.');
			return;
		}

		var vars = new Object();

		vars.c = 'ebusker_mobile';
		vars.a = 'transaction';

		d = new Object();
		d['amount'] = this.transactionTotal;
		d['comments'] = $('#transaction_comments').val();

		vars.d = $.toJSON(d);

		$.post('http://sandbox.openbroadcaster.com/api.php',vars,function(response)
		{

			if(response.status == false) alert('Transaction failed.  Please try again alter.');

			else
			{
				if(typeof(device)!='undefined') App.notice.play();
				$.mobile.changePage('#home');
			}

		}, 'json');


	}

}

App.init = function()
{

	$.mobile.allowCrossDomainPages = true;

	$(document).ajaxStart(function() { App.NowPlaying.ajaxRunning = true; });
	$(document).ajaxStop(function() { App.NowPlaying.ajaxRunning = false; });

	App.NowPlaying.tickId = setInterval(App.NowPlaying.tick,100);

}

$(document).ready(function() {
	if(navigator.userAgent.indexOf('Chrome')>-1 || navigator.userAgent.indexOf('Firefox')>-1) App.init();
});
