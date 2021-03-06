(function () {

var template = '[{display_name}]({link}) '          +
		'has {reputation} reputation, '             +
		'earned {reputation_change_day} rep today, '+
		'asked {question_count} questions, '        +
		'gave {answer_count} answers, '             +
		'for a q:a ratio of {ratio}.\n';

var extended_template = 'avg. rep/post: {avg_rep_post}, ' +
		'{gold} gold badges, ' +
		'{silver} silver badges and ' +
		'{bronze} bronze badges. ';

var site = /chat\.(\w+)/.exec( location )[ 1 ];

function stat ( msg, cb ) {
	var args = msg.parse(),
		id = args[ 0 ], extended = args[ 1 ] === 'extended';

	if ( !id ) {
		id = msg.get( 'user_id' );
	}
	else if ( !/^\d+$/.test(id) ) {
		id = msg.findUserid( id );
	}

	//~10% chance
	if ( Math.random() <= 0.1 ) {
		finish( 'That dude sucks' );
		return;
	}

	IO.jsonp({
		url : 'https://api.stackexchange.com/2.0/users/' + id,
		data : {
			site   : site,
			filter :  '!G*klMsSp1IcBUKxXMwhRe8TaI(' //ugh, don't ask...
		},
		fun : done
	});

	function done ( resp ) {
		if ( resp.error_message ) {
			finish( resp.error_message );
			return;
		}

		var user = resp.items[ 0 ], res;

		if ( !user ) {
			res = 'User ' + id + ' not found';
		}
		else {
			res = handle_user_object( user, extended );
		}

		finish( res );
	}

	function finish ( res ) {
		if ( cb ) {
			cb( res );
		}
		else {
			msg.reply( res );
		}
	}
}

function handle_user_object ( user, extended ) {
	user = normalize_stats( user );

	var res = template.supplant( user );

	if ( extended ) {
		res += extended_template.supplant( calc_extended_stats(user) );
	}

	return res;
}

function normalize_stats ( stats ) {
	stats = Object.merge(
		{
			question_count        : 0,
			answer_count          : 0,
			reputation_change_day : 0
		},
		stats );

	//for teh lulz
	if ( !stats.question_count && stats.answer_count ) {
		stats.ratio = "H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ";
	}
	else if ( !stats.answer_count && stats.question_count ) {
		stats.ratio = "TO͇̹̺ͅƝ̴ȳ̳ TH̘Ë͖́̉ ͠P̯͍̭O̚​N̐Y̡";
	}
	else if ( !stats.answer_count && !stats.question_count ) {
		stats.ratio = 'http://www.imgzzz.com/i/image_1294737413.png';
	}
	else {
		stats.ratio = Math.ratio( stats.question_count, stats.answer_count );
	}

	console.log( stats, '/stat normalized' );
	return stats;
}

function calc_extended_stats ( stats ) {
	stats = Object.merge( stats.badge_counts, stats );

	stats.avg_rep_post = stats.reputation
		/
		( stats.question_count + stats.answer_count );

	//1 / 0 === Infinity
	if ( stats.avg_rep_post === Infinity ) {
		stats.avg_rep_post = 'T͎͍̘͙̖̤̉̌̇̅ͯ͋͢͜͝H̖͙̗̗̺͚̱͕̒́͟E̫̺̯͖͎̗̒͑̅̈ ̈ͮ̽ͯ̆̋́͏͙͓͓͇̹<̩̟̳̫̪̇ͩ̑̆͗̽̇͆́ͅC̬͎ͪͩ̓̑͊ͮͪ̄̚̕Ě̯̰̤̗̜̗͓͛͝N̶̴̞͇̟̲̪̅̓ͯͅT͍̯̰͓̬͚̅͆̄E̠͇͇̬̬͕͖ͨ̔̓͞R͚̠̻̲̗̹̀>̇̏ͣ҉̳̖̟̫͕ ̧̛͈͙͇͂̓̚͡C͈̞̻̩̯̠̻ͥ̆͐̄ͦ́̀͟A̛̪̫͙̺̱̥̞̙ͦͧ̽͛̈́ͯ̅̍N̦̭͕̹̤͓͙̲̑͋̾͊ͣŅ̜̝͌͟O̡̝͍͚̲̝ͣ̔́͝Ť͈͢ ̪̘̳͔̂̒̋ͭ͆̽͠H̢͈̤͚̬̪̭͗ͧͬ̈́̈̀͌͒͡Ơ̮͍͇̝̰͍͚͖̿ͮ̀̍́L͐̆ͨ̏̎͡҉̧̱̯̤̹͓̗̻̭ͅḐ̲̰͙͑̂̒̐́̊';
	}

	console.log( stats, '/stat extended' );
	return stats;
}

bot.addCommand({
	name : 'stat',
	fun : stat,
	permissions : {
		del : 'NONE'
	},

	description : 'Gives useless stats on a user. `/stat usrid|usrname`',
	async : true
});

}());
