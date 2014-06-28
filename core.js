/*
Developer: Emian Amanullah (emian@shuf.com)
Distributed under GNU GPL 2.
---
Костяк ИИ нард основан на разработке замечательного программиста Лутца Татенхана (Lutz Tautenhahn, http://www.lutanho.net/). Алгоритм ИИ (функция Evaluate) - его.
Ссылка на оригинал: http://www.lutanho.net/stroke/online.html (Backgammon)
*/

// INITIALISING

// Canvas loading
var canvas = document.getElementById('canvas');
var ctx;
var error = false;
if (canvas.getContext) {
	var ctx = canvas.getContext('2d');
} else {
	error = true;
}
function event(x, y) { // Checking click on canvas
	if (y<100) {
		if (x<600) {
			ClickPoint(Math.floor(x/50)+13,1);
		} else {
			ClickBar(0,1);
		}
	} else if (y>150) {
		if (x<600) {
			ClickPoint(12-Math.floor(x/50),1);
		} else {
			ClickBar(1,1);
		}
	}
}
canvas.onclick = function(e) {
	var x = e.pageX-$("#canvas").offset().left
	var y = e.pageY-$("#canvas").offset().top;
	event(x, y);
};

// Images loading
var units = {
	'saracens': new Image(),
	'crusarders': new Image(),
	'undeads': new Image()
};
var castles = {
	'saracens': new Image(),
	'crusarders': new Image(),
	'undeads': new Image()
};
var fireImg = new Image();
var corpseImg = new Image ();
$("#progress").html("Loading sprites...");
units['saracens'].onload = function() {
	units['crusarders'].onload = function() {
		units['undeads'].onload = function() {
			$("#progress").html("Loading buildings...");
			castles['saracens'].onload = function() {
				castles['crusarders'].onload = function() {
					castles['undeads'].onload = function() {
						$("#progress").html("Loading fires...");
						fireImg.onload = function() {
							$("#progress").html("Loading bones...");
							corpseImg.onload = function() {
								$("#progress").hide(0);
								Init("equal",true,false);
							};
							corpseImg.src = 'images/corpse.gif';
						};
						fireImg.src = 'images/fire.gif';
					};
					castles['undeads'].src = 'images/undeads_castle.gif';
				};
				castles['crusarders'].src = 'images/crusarders_castle.gif';
			};
			castles['saracens'].src = 'images/saracens_castle.gif';
		};
		units['undeads'].src = 'images/undeads.gif';
	};
	units['crusarders'].src = 'images/crusarders.gif';
};
units['saracens'].src = 'images/saracens.gif';
// Variables preparing
var tutorialPage=0;
var currentPlayer, moveValue, maxValue, nDraw;
moveFrom=new Array(5); // Point of field, where was used dice
moveTo=new Array(5);
player=new Array(2);
player[0] = new Player('Saracen','saracens',true);
player[1] = new Player('Crusarder','crusarders',false);
field=new Array(26);
curClick=new Array(5);
bestClick=new Array(5);
var curDice, bestDice, bestValue;
bar=new Array(2);
dice=new Array(2);
for (var i=0; i<2; i++) dice[i]=new Array(4);
var rollDisabled, okDisabled, cancelDisabled, switchDisabled;
var currentAction="starting";
var aiActive=false;
var gameType="classic", player1=true, player2=false;
var camp = -1, camp_miss = -1;
var score = 0;

function SwitchAI (pl) {
	document.getElementById("clickSnd").play();
	if (settings['custom']['AI'+pl]) {
		settings['custom']['AI'+pl] = false;
		$("#AI"+pl).attr("src","images/ai.gif");
	} else {
		settings['custom']['AI'+pl] = true;
		$("#AI"+pl).attr("src","images/human.gif");
	}
}
function SwitchFraction (pl) {
	document.getElementById("clickSnd").play();
	settings['custom']['Fraction'+pl]++;
	if (settings['custom']['Fraction'+pl]==fractions.length) settings['custom']['Fraction'+pl] = 0;
	$("#Fraction"+pl).attr("src","images/"+fractions[settings['custom']['Fraction'+pl]]+"_flag_mini.gif");
}

function SwitchMenu(type) {
	document.getElementById("clickSnd").play();
	switch(type) {
		case "campaign":
			$('#gametype').hide(0);
			$('#players').hide(0);
			$('#campaign').show(0);
			$('#campaign_menu').show(0);
			break;
		case "skirmish": 
			$('#gametype').show(0);
			$('#players').show(0);
			$('#campaign').hide(0);
			$('#campaign_menu').hide(0);
			break;	
	}
}

function Start() {
	currentPlayer=-1;
	currentAction="starting";
	$("#new").hide(0);
	$("#game").show(0);
	player1 = settings['custom']['AI1'];
	player2 = settings['custom']['AI2'];
	player[0]['fraction'] = fractions[settings['custom']['Fraction1']];
	player[1]['fraction'] = fractions[settings['custom']['Fraction2']];
	var map = settings['custom']['Map'];
	Init(gameType,player1,player2,map);
}

function StartMission() {
	currentPlayer=-1;
	currentAction="starting";
	$("#new").hide(0);
	$("#game").show(0);
	player1 = true;
	player2 = false;
	player[0]['fraction'] = fractions[campaigns[camp]['missions'][camp_miss]['Fraction1']];
	player[1]['fraction'] = fractions[campaigns[camp]['missions'][camp_miss]['Fraction2']];
	var map = campaigns[camp]['missions'][camp_miss]['map'];
	Init(campaigns[camp]['missions'][camp_miss]['position'],player1,player2,map);
}
function NewCampaign(cmp) {
	camp = cmp;
	camp_miss = 0;
	Briefing();
}
function Briefing() {
	if (camp_miss==0)
		$('#brief').html(campaigns[camp]['brief']);
	else if (campaigns[camp]['missions'][camp_miss]!==undefined)
		$('#brief').html(campaigns[camp]['missions'][camp_miss]['brief']);
	else 
		$('#brief').html(campaigns[camp]['end']);
	$('#briefing').show(500);
}
function Return() {
	$("#game").hide(0);
	$("#new").show(0);
	$('#briefing').hide(500);
}
function Next() {
	if (camp_miss==-1) {
		$("#game").hide(0);
		$("#new").show(0);
		$('#briefing').hide(0);
	}
	if (camp_miss==0) {
		camp_miss++;
		Briefing();
		return true;
	}
	if (campaigns[camp]['missions'][camp_miss]===undefined)
		$('#brief').html(campaigns[camp]['end']);
	else {
		$('#briefing').hide(0);
		StartMission();
	}
}
function Continue() {
	camp = getCookie('last_camp');
	camp_miss = getCookie('camp_miss');
	if (camp>=0 && camp_miss>=0 && camp!==null && camp_miss!==null)
		Briefing();
	else
		alert("Save not found or corrupted.");
}
function TopScores () {
	var undeads_score = getCookie('score_3');
	var saracens_score = getCookie('score_2');
	var crusaders_score = getCookie('score_1');
	var listing = "";
	if (crusaders_score!==null) 
		listing += "<p><b>Crusade</b>: "+crusaders_score+"</p>";
	if (saracens_score!==null) 
		listing += "<p><b>War for Faith</b>: "+saracens_score+"</p>";
	if (undeads_score!==null) 
		listing += "<p><b>Birthright</b>: "+undeads_score+"</p>";
	$('#score').html(listing);
	$('#scores').show(500);
}
function CloseScores () {
	$('#scores').hide(500);
}
function endBattle (winner,pl1ost,pl2ost,pl1dead,pl2dead) {
	if (winner==2) {
		$('#brief').html(campaigns[camp]['lose']);
		camp_miss=-1;
		camp=-1;
		$('#briefing').show(0);
	} else {
		camp_miss++;
		score = getCookie('score');
		if (score===null) score = 0;
		score+=(15 + (15-pl2ost) + pl2dead*3)*(pl2ost==15?2:1);
		if (campaigns[camp]['missions'][camp_miss]!==undefined) {
			setCookie('last_camp', camp);
			setCookie('camp_miss', camp_miss);
			setCookie('score', score);
			Briefing();
		} else {
			var last_best = getCookie('score_'+camp);
			if (last_best===null) last_best = 0;
			if (score>last_best)
				setCookie('score_'+camp, score);
			setCookie('last_camp', -1);
			setCookie('camp_miss', -1);			
			$('#brief').html(campaigns[camp]['end']+"<p>Your <b>score</b>: "+score+". "+(score>last_best?"Congratulations! It's NEW record!":"")+"</p>");
			$('#briefing').show(500);
			camp_miss=-1;
			camp=-1;
		}
	}
}

function ChangeGType() {
	document.getElementById("clickSnd").play();
	switch (gameType) {
		case "long":
			gameType="classic";
			$("#gtype").attr("src","images/classic.gif");
			break;
		case "classic":
			gameType="equal";
			$("#gtype").attr("src","images/battle.gif");
			break;
		case "equal":
			gameType="sarDef";
			$("#gtype").attr("src","images/sarDef.gif");
			break;
		case "sarDef":
			gameType="crusDef";
			$("#gtype").attr("src","images/crusDef.gif");
			break;
		case "crusDef":
			gameType="long";
			$("#gtype").attr("src","images/opposition.gif");
			break;
	}
}

function SetPlayer(plr,type) { // Change player's type: true - human, false - AI
	player[plr].human=type;
}

function RollDisabling(bool) {
	if (!bool) $("#roll").attr("src", "images/roll_active.gif");
		else $("#roll").attr("src", "images/roll_passive.gif");
	rollDisabled=bool;
}

function OKDisabling(bool) {
	if (!bool) $("#ok").attr("src", "images/ok_active.gif");
		else $("#ok").attr("src", "images/ok_passive.gif");
	okDisabled=bool;
}

function CancelDisabling(bool) {
	if (!bool) $("#cancel").attr("src", "images/cancel_active.gif");
		else $("#cancel").attr("src", "images/cancel_passive.gif") ;
	cancelDisabled=bool;
}

function SwitchDisabling(bool) {
	if (!bool) $("#switch").attr("src", "images/change_active.gif");
		else $("#switch").attr("src", "images/change_passive.gif") ;
	switchDisabled=bool;
}

function Init(type, pl1type, pl2type, map) {
	$("#map").css("background-image", "url(images/"+map+")");
	$("#current").css("background-image", "url(images/flag.gif)");
	$("#pl2").css("background-image", "url(images/player_border_passive.gif)");
	$("#pl1").css("background-image", "url(images/player_border_passive.gif)");
	field = Clone(arrangement[type]);
	for (var i=0; i<2; i++) bar[i] = 0;
	for (var i=0; i<5; i++) dice[0][i] = 0;
	for (var i=0; i<5; i++) dice[1][i] = 0;
	currentPlayer=-1;
	player[0].human = pl1type;
	player[1].human = pl2type;
	if (!pl1type || !pl2type) {
		aiActive = true;
		setTimeout("Timer()",1000);
	}
	nDraw=0;
	for (var i=0; i<4; i++) {
		moveFrom[i]=-1;
		moveTo[i]=-1;
	}
	RefreshScreen();
	$("#msg").html("You must roll dices!");
	currentAction="rolling";
	RollDisabling(false);
	SwitchDisabling(true);
	OKDisabling(true);
	CancelDisabling(true);
	$("#pl1Power").html("360");
	$("#pl2Power").html("360");
}

function Timer() {
	if (aiActive) setTimeout("Timer()",1000);
	if (currentPlayer<0) return;
	if (nDraw>0) {
		if (bestDice>0) {
			$("#msg").html("AI switches dices!");
			SwitchDice(currentPlayer,2);
			bestDice=0;
			return;
		}
		for (var i=3; i>=0; i--) {
			if (bestClick[i]>=0) {
				if (bestClick[i]==0) ClickBar(currentPlayer,2);
					else ClickPoint(bestClick[i],2);
				$("#msg").html("AI moves his units!");
				bestClick[i]=-1;
				nDraw++;
				return;
			}
		}
		if (nDraw==1) {
			$("#msg").html("AI passed!");
			nDraw++;
			return;
		}
		$("#msg").html("");
		OKClick(true);
		nDraw=0;
	} else {
		if (!player[currentPlayer].human) {
			if (currentAction!="rolling") {
				CancelClick(true);
				GetmaxValue(true);
			} else {
				$("#msg").html("AI rolls dices!");
				RollDice(true);
			}
			nDraw=1;
		}
	}
}

function RollDice(isAI) {
	if (currentPlayer<0) { // For define who will be moving first
		do {
			dice[0][1]=random(6)+1;
			dice[1][2]=random(6)+1;
		} while(dice[0][1]==dice[1][2])
		moveValue=0;
		maxValue=dice[0][1]+dice[1][2];
		RefreshDice();
		if (dice[0][1]>dice[1][2]) $("#msg").html(player[0]['name']+" begin!");
			else $("#msg").html(player[1]['name']+" begin!");
		currentAction="moving";
	} else {
		dice[currentPlayer][1]=random(6)+1;
		dice[currentPlayer][2]=random(6)+1;
		if (dice[currentPlayer][1]==dice[currentPlayer][2]) {
			dice[currentPlayer][0]=dice[currentPlayer][2];
			dice[currentPlayer][3]=dice[currentPlayer][2];
			dice[currentPlayer][4]=0;
		} else if (dice[currentPlayer][1]+dice[currentPlayer][2]==7) {
			dice[currentPlayer][0]=random(6)+1;
			dice[currentPlayer][3]=0;
			dice[currentPlayer][4]=0;
			} else {
				dice[currentPlayer][0]=0;
				dice[currentPlayer][3]=0;
				dice[currentPlayer][4]=0;
				}
		moveValue=0;
		currentAction="moving";
		GetmaxValue(isAI);
		RefreshDice();
		if (player[currentPlayer].human) $("#msg").html("Select unit to move!");
	}
}

function Evaluate(summarValue) {
	if (summarValue==0) return;
	var power0=0, power1=0, lastPl1=0, lastPl2=25, power, iinv=-1;
	for (var i=1; i<25; i++) {
		if (field[i]<0) { // Player 2
			power1+=(i-25)*field[i]; // Moves to do by player 2
			power1+=-field[i]*(i-12.5)*(i-12.5)/50; // Keep the stones in the middle
			if (iinv==-1) iinv=0; // Player 2 found
			if (lastPl2>i) lastPl2=i; // Find last player 2
		}
		if (field[i]>0) { // Player 1
			power0+=i*field[i];
			power0+=field[i]*(i-12.5)*(i-12.5)/50; // Keep the stones in the middle
			if (iinv==0) iinv=1; // Player 1 found after player 2 -> inversion
			if (lastPl1<i) lastPl1=i; // Find last player 1 unit
		}
	}
	if (bar[0]>0) {
		power0+=bar[0]*32; // The way, player 1 have to go = 25 + bonus for capturing
		lastPl1=25; // Position of the last pl1
	}
	if (bar[1]>0) {
		power1+=bar[1]*32; // The way, player 2 have to go = 25 + bonus for capturing
		lastPl2=0; // Position of the last crusarder
	}
	if (currentPlayer==0) { // Evaluate from player 1 point of view
		power=power1-power0;
		if ((iinv>0)||(bar[1]>0)) { // There's an inversion
			for (var i=1; i<25; i++) {
				if ((field[i]==1)&&(lastPl2<i)) power-=(25-i)/3; // Can be captured
				if (field[i]>1) power+=3;
			}
		} else {
			for (var i=1; i<=6; i++)
				if (field[i]!=0) power+=3;
		}
		power+=field[0]*3;
	} else { // Evaluate from player 2 point of view
		power=power0-power1;
		if ((iinv>0)||(bar[0]>0)) { // There's an inversion
			for (var i=1; i<25; i++) {
				if ((field[i]==-1)&&(lastPl1>i)) power-=i/3; // Can be captured
				if (field[i]<-1) power+=3;
			}
		} else {
			for (var i=19; i<=24; i++)
				if (field[i]!=0) power+=3;
		}
		power-=field[25]*3;
	}
	power+=Math.random()/100;
	if ((maxValue<summarValue)||(bestValue<power)) { // Remembering of the best values
		maxValue=summarValue;
		bestValue=power;
		bestDice=curDice;
		for (var i=0; i<4; i++)
			bestClick[i]=curClick[i];
	}
}

function VirtualClick(iteration, isAI, summarValue) { // Iteration means which dice we used
	if (iteration==0) { // Calculate results on last iteration
		if (maxValue<=summarValue) {
			if (isAI) Evaluate(summarValue);
			 else maxValue=summarValue;
		}
		return;
	}
	var step=iteration-1, usedDice;
	if (bar[currentPlayer]>0) { // If we have deads - we must reanimate them first
		curClick[step]=0;
		usedDice=ClickBar(currentPlayer,false);
		if (usedDice>0) {
			VirtualClick(step, isAI, usedDice+summarValue);
			CancelClick(false);
		} else VirtualClick(0, isAI, summarValue); // If we can'not moving
	} else {
		for (var i=1; i<=24; i++) {
			curClick[step]=i;
			usedDice=ClickPoint(i,false);
			if (usedDice>0) {
				VirtualClick(step, isAI, usedDice+summarValue);
				CancelClick(false);
			} else VirtualClick(0, isAI, summarValue); // If we can'not moving
		}
	}
}

function GetmaxValue(isAI) {
	var diceSum=dice[currentPlayer][0]+dice[currentPlayer][1]+dice[currentPlayer][2]+dice[currentPlayer][3]+dice[currentPlayer][4];
	maxValue=0;
	if (isAI) {
		for (i=0; i<4; i++) curClick[i]=-1;
		curDice=0;
		bestDice=0;
		bestValue=-9999;
	}
	if (dice[currentPlayer][0]>0 && dice[currentPlayer][3]==0) {
		VirtualClick(3,isAI,0);
		if (!isAI && (maxValue==diceSum)) return;
		SwitchDice(currentPlayer,false);
		if (isAI) curDice=1;
		VirtualClick(3,isAI,0);
		SwitchDice(currentPlayer,false);
		if (isAI) curDice=0;
		VirtualClick(3,isAI,0);
		SwitchDice(currentPlayer,false);
	} else if (dice[currentPlayer][0]==0) {
		VirtualClick(2,isAI,0);
		if (!isAI &&(maxValue==diceSum)) return;
		SwitchDice(currentPlayer,false);
		if (isAI) curDice=1;
		VirtualClick(2,isAI,0);
		SwitchDice(currentPlayer,false);
	} else VirtualClick(4,isAI,0);
}

function RollClick() {
	if (rollDisabled) return;
	if ((currentPlayer>=0) && (!player[currentPlayer].human)) return;
	document.getElementById("diceSnd").play();
	RollDice(false);
	RollDisabling(true);
	SwitchDisabling(false);
	if (currentPlayer<0) {
		if (!player[0].human && !player[1].human) OKClick(true);
			else {
				OKDisabling(false);
				SwitchDisabling(true);
			}
	} else {
		if (maxValue==0) {
			$("#msg").html("You must pass!");
			OKDisabling(false);
			$("#ok").attr("src", "images/pass_active.gif");
		} else if (player[currentPlayer].human && bar[currentPlayer]>0) $("#msg").html("You must reanimate your dead units!");
	}
}

function SurrenderClick() {
	document.getElementById("clickSnd").play();
	if (confirm("Do you really want to surrender?")) {
		currentPlayer=-1;
		currentAction="starting";
		aiActive=false;
		RefreshScreen();
		$("#game").hide(0);
		$("#new").show(0);
	}
}

function OKClick(isAI) {
	if (okDisabled && !isAI) return;
	document.getElementById("clickSnd").play();
	if (currentPlayer<0) {
		if (dice[0][1]>dice[1][2]) {
			dice[0][2]=dice[1][2];
			dice[1][2]=0;
			currentPlayer=0;
			$("#current").css("background-image", "url(images/"+player[0]['fraction']+"_flag_mini.gif)");
			$("#pl2").css("background-image", "url(images/player_border_passive.gif)");
			$("#pl1").css("background-image", "url(images/player_border.gif)");
		} else {
			dice[1][1]=dice[1][2];
			dice[1][2]=dice[0][1];
			dice[0][1]=0;
			currentPlayer=1;
			$("#current").css("background-image", "url(images/"+player[1]['fraction']+"_flag_mini.gif)");
			$("#pl2").css("background-image", "url(images/player_border.gif)");
			$("#pl1").css("background-image", "url(images/player_border_passive.gif)");
		}
		if (player[currentPlayer].human) $("#msg").html("Select unit to move!");
		OKDisabling(true);
		if (player[currentPlayer].human) {
			RollDisabling(true);
			SwitchDisabling(false);
		} else {
			RollDisabling(true);
			SwitchDisabling(true);
		}
		RefreshDice();
	} else {
		dice[currentPlayer][0]=0;
		dice[currentPlayer][1]=0;
		dice[currentPlayer][2]=0;
		dice[currentPlayer][3]=0;
		dice[currentPlayer][4]=0;
		RefreshDice();
		currentPlayer=1-currentPlayer;
		if (currentPlayer==0) {
			$("#current").css("background-image", "url(images/"+player[0]['fraction']+"_flag_mini.gif)");
			$("#pl2").css("background-image", "url(images/player_border_passive.gif)");
			$("#pl1").css("background-image", "url(images/player_border.gif)");
		} else {
			$("#current").css("background-image", "url(images/"+player[1]['fraction']+"_flag_mini.gif)");
			$("#pl2").css("background-image", "url(images/player_border.gif)");
			$("#pl1").css("background-image", "url(images/player_border_passive.gif)");
		}
		if (player[currentPlayer].human) {
			RollDisabling(false);
			SwitchDisabling(true);
			$("#msg").html("Roll dices!");
		} else {
			RollDisabling(true);
			SwitchDisabling(true);
		}
		if (currentAction=="moving") currentAction="rolling";
		OKDisabling(true);
		CancelDisabling(true);
		SwitchDisabling(true);
		var power=0;
		for (var i=1; i<25; i++) {
			if (field[i]>0)
				power+=i*field[i];
		}
		power+=bar[0]*25;
		$("#pl2Power").html(power);
		if (power==0) {
			RollDisabling(true); // pl1's victory
			SwitchDisabling(true);
			currentAction="starting";
			aiActive=false;
			$("#msg").html(player[0]['name']+" won!");
			document.getElementById("endSnd").play();
			currentPlayer=-1;
			//if (field[25]==0) endBattle(true,2);
			//	else endBattle(true,1);
			endBattle(1,field[0],field[25],bar[0],bar[1]);
		}
		power=0;
		for (var i=1; i<25; i++) {
			if (field[i]<0)
				power-=(25-i)*field[i];
		}
		power-=bar[1]*25;
		$("#pl1Power").html(power);
		if (power==0) {
			RollDisabling(true); // pl2's victory
			SwitchDisabling(true);
			currentAction="starting";
			aiActive=false;
			$("#msg").html(player[1]['name']+" won!");
			document.getElementById("endSnd").play();
			currentPlayer=-1;
			//if (field[0]==0) endBattle(false,2);
			//	else endBattle(false,1);
			endBattle(2,field[0],field[25],bar[0],bar[1]);
		}		
	}
}

function CancelClick(visible) {
	if (cancelDisabled && visible) return;
	if (currentPlayer<0) return;
	document.getElementById("clickSnd").play();
	var goal, lastUsableDice=3;
	moveValue=0;
	while ((lastUsableDice>=0)&&(dice[currentPlayer][lastUsableDice]>=0)) lastUsableDice--;
	if (lastUsableDice<0) {
		if (visible) {
			RefreshDice();
			OKDisabling(true);
			CancelDisabling(true);
		}
		return;
	}
	dice[currentPlayer][lastUsableDice]*=-1;
	if (currentPlayer==0) {
		if (moveFrom[lastUsableDice]==25) {
			bar[0]++;
			if (visible) RefreshBar(0);
		} else {
			field[moveFrom[lastUsableDice]]++;
			if (visible) RefreshPoint(moveFrom[lastUsableDice]);
		}
		goal=moveFrom[lastUsableDice]-dice[0][lastUsableDice];
		if (goal<0) goal=0;
		field[goal]=moveTo[lastUsableDice];
		if (visible) RefreshPoint(goal);
		if (moveTo[lastUsableDice]<0) {
			bar[1]--;
			if (visible) RefreshBar(1);
		}
	} else {
		if (moveFrom[lastUsableDice]==0) {
			bar[1]++;
			if (visible) RefreshBar(1);
		} else { field[moveFrom[lastUsableDice]]--;
			if (visible) RefreshPoint(moveFrom[lastUsableDice]);
		}
		goal=moveFrom[lastUsableDice]+dice[1][lastUsableDice];
		if (goal>25) goal=25;
		field[goal]=moveTo[lastUsableDice];
		if (visible) RefreshPoint(goal);
		if (moveTo[lastUsableDice]>0) {
			bar[0]--;
			if (visible) RefreshBar(0);
		}
	}
	if (visible) CancelClick(visible);
}

function RefreshScreen() {
	for (var i=0; i<26; i++) RefreshPoint(i);
	for (var i=0; i<2; i++) RefreshBar(i);
	RefreshDice();
}

function RefreshPoint(point) { 
	// Castles and fires
	if (point==0||point==25) {
		var castle = (point==0) ? castles[player[1]['fraction']] : castles[player[0]['fraction']];
		ctx.clearRect(600, (150*((25-point)/25)), 85, 100);
		ctx.fillRect(600, (150*((25-point)/25)), 3, 100);
		ctx.drawImage(castle, 600, (150*((25-point)/25)));
		for (var i=0; i<Math.abs(field[point]); i++) {
			switch ((i+1)%3) {
				case 0:
					ctx.drawImage(fireImg, 0, 0, 16, 16, 600+Math.pow(i+2,3)%69, (150*((25-point)/25))+Math.pow(i+2,3)%85, 16, 16);
					break;
				case 1:
					ctx.drawImage(fireImg, 16, 0, 16, 16, 600+Math.pow(i+2,3)%69, (150*((25-point)/25))+Math.pow(i+2,3)%85, 16, 16);
					break;
				case 2:
					ctx.drawImage(fireImg, 32, 0, 16, 16, 600+Math.pow(i+2,3)%69, (150*((25-point)/25))+Math.pow(i+2,3)%85, 16, 16);
					break;
			}
		}
		RefreshBar((25-point)/25);
	}
	// Units on field
	if (point>=13 && point<=24) { // Top side
		ctx.clearRect(50*(point-13), 0, 50, 100);
		if (point==19)
			ctx.fillRect(50*(point-13), 0, 3, 100);
		else
			ctx.fillRect(50*(point-13), 0, 1, 100);
		if (Math.abs(field[point])>0) {
			var tab=Math.floor(80/Math.abs(field[point]));
			var shift = (Math.abs(field[point])==1)? 32: 0;
			var unit = (field[point]>0) ? units[player[0]['fraction']] : units[player[1]['fraction']];
			for (var i=0; i<Math.abs(field[point]); i++)
				ctx.drawImage(unit, (64*(field[point]>0?1:0))+0, 0, 32, 32, 50*(point-13)+(i%2)*18, 0+shift+tab*i, 32, 32);
		}
	}
	if (point>=1 && point<=12) { // Bottom side
		ctx.clearRect(600-50*point, 150, 50, 100);
		if (point==6)
			ctx.fillRect(600-50*point, 150, 3, 100);
		else
			ctx.fillRect(600-50*point, 150, 1, 100);
		if (Math.abs(field[point])>0) {
			var tab=Math.floor(80/Math.abs(field[point]));
			var shift = (Math.abs(field[point])==1)? 32: 0;
			var unit = (field[point]>0) ? units[player[0]['fraction']] : units[player[1]['fraction']];
			for (var i=0; i<Math.abs(field[point]); i++) 
				ctx.drawImage(unit, (64*(field[point]>0?1:0))+32, 0, 32, 32, 600-50*point+(i%2)*18, 150+shift+tab*i, 32, 32);
		}
	}
}

function RefreshBar(plr) {
	ctx.clearRect(684, 150*plr, 16, 100);
	for (var i=0; i<bar[plr]; i++)
		ctx.drawImage(corpseImg, 684, 150*plr+5*i);
}

function RefreshDice() {
	if (currentPlayer==-1) { // Dices of determination turns
		for (var i=0; i<5; i++) $("#dice"+i).attr("src", "images/d00.gif");
		if (dice[0][1]!=0) $("#dice4").attr("src", "images/d1"+dice[0][1]+".gif");
		if (dice[1][2]!=0) $("#dice0").attr("src", "images/d1"+dice[1][2]+".gif");
	} else { // Standard dices
		for (var i=0; i<5; i++) {
			if (dice[currentPlayer][i]==0) $("#dice"+i).attr("src", "images/d00.gif");
				else {
					if (dice[currentPlayer][i]>0) $("#dice"+i).attr("src", "images/d1"+dice[currentPlayer][i]+".gif");
						else $("#dice"+i).attr("src", "images/d2"+Math.abs(dice[currentPlayer][i])+".gif");
				}
		}
	}
}

function ClickPoint(point,visible) {
	if (currentPlayer<0) return(0);
	if ((visible==1)&&(! player[currentPlayer].human)) return(0);
	if (field[point]==0) return(0);
	if ((field[point]<0)&&(currentPlayer==0)||(field[point]>0)&&(currentPlayer==1)) return(0);
	if (bar[currentPlayer]>0) return(0);
	var goal, usableDice=0;
	while ((usableDice<=4)&&(dice[currentPlayer][usableDice]<=0)) usableDice++;
	if (usableDice==5) return(0);
	if (currentPlayer==0) {
		goal=point-dice[0][usableDice];
		if (goal<=0) {
			goal=0;
			for (var i=7; i<25; i++)
				if (field[i]>0) return(0);
		}
		if (field[goal]<-1) return(0);
		moveFrom[usableDice]=point;
		moveTo[usableDice]=field[goal];
		field[point]--;
		if (visible>0) RefreshPoint(point);
		field[goal]++;
		if (field[goal]==0) {
			bar[1]++;
			if (visible>0) {
				RefreshBar(1);
				document.getElementById("captureSnd").play();
			}
			field[goal]++;
		} else if (goal==0) {
			if (visible>0) document.getElementById("explosionSnd").play();
		} else {
			if (visible>0) document.getElementById("stepSnd").play();
		}
		if (visible>0) RefreshPoint(goal);
		moveValue+=point-goal;
		if ((visible==1) && (moveValue==maxValue)) OKDisabling(false);
		dice[0][usableDice]*=-1;
		if (visible>0) {
			RefreshDice();
			$("#msg").html("");
		}
		if (visible==1 && dice[0][0]<=0 && dice[0][1]<=0) CancelDisabling(false);
		return(point-goal);
	}
	else {
		goal=point+dice[1][usableDice];
		if (goal>=25) {
			goal=25;
			for (var i=1; i<19; i++)
				if (field[i]<0) return(0);
		}
		if (field[goal]>1) return(0);
		moveFrom[usableDice]=point;
		moveTo[usableDice]=field[goal];
		field[point]++;
		if (visible>0) RefreshPoint(point);
		field[goal]--;
		if (field[goal]==0) {
			bar[0]++;
			if (visible>0) {
				RefreshBar(0);
				document.getElementById("captureSnd").play();
			}
			field[goal]--;
		} else if (goal==25) {
			if (visible>0) document.getElementById("explosionSnd").play();
		} else {
			if (visible>0) document.getElementById("stepSnd").play();
		}
		if (visible>0) RefreshPoint(goal);
		moveValue+=goal-point;
		if ((visible==1) &&(moveValue==maxValue)) OKDisabling(false);
		dice[1][usableDice]*=-1;
		if (visible>0) {
			RefreshDice(1);
			$("#msg").html("");
		}
		if (visible==1 && dice[1][0]<=0 && dice[1][1]<=0) CancelDisabling(false);
		return(goal-point);
	}
}

function ClickBar(plr, visible) {
	if (currentPlayer!=plr) return(0);
	if ((visible==1)&&(!player[plr].human)) return(0);
	if (bar[plr]==0) return(0);
	var usableDice=0;
	while ((usableDice<=3)&&(dice[currentPlayer][usableDice]<=0)) usableDice++;
	if (usableDice==5) return(0);
	if (currentPlayer==0) {
		if (field[25-dice[0][usableDice]]<-1) return(0);
		moveFrom[usableDice]=25;
		moveTo[usableDice]=field[25-dice[0][usableDice]];
		bar[plr]--;
		if (visible>0) RefreshBar(plr);
		field[25-dice[0][usableDice]]++;
		if (field[25-dice[0][usableDice]]==0) {
			bar[1]++;
			if (visible>0) RefreshBar(1);
			field[25-dice[0][usableDice]]++;
		}
		if (visible>0) { 
			RefreshPoint(25-dice[0][usableDice]);
			document.getElementById("stepSnd").play();
		}
		moveValue+=dice[0][usableDice];
		if ((visible==1)&&(moveValue==maxValue)) OKDisabling(false);
		dice[0][usableDice]*=-1;
		if (visible>0) {
			RefreshDice(0);
			$("#msg").html("");
		}
		if (visible==1 && dice[0][0]<=0 && dice[0][1]<=0) CancelDisabling(false);
		return(-dice[0][usableDice]);
	} else {
		if (field[dice[1][usableDice]]>1) return(0);
		moveFrom[usableDice]=0;
		moveTo[usableDice]=field[dice[1][usableDice]];
		bar[plr]--;
		if (visible>0) RefreshBar(plr);
		field[dice[1][usableDice]]--;
		if (field[dice[1][usableDice]]==0) {
			bar[0]++;
			if (visible>0) {
				RefreshBar(1);
				document.getElementById("stepSnd").play();
			}
			field[dice[1][usableDice]]--;
		}
		if (visible>0) RefreshPoint(dice[1][usableDice]);
		moveValue+=dice[1][usableDice];
		if ((visible==1) &&(moveValue==maxValue)) OKDisabling(false);
		dice[1][usableDice]*=-1;
		if (visible>0) {
			RefreshDice(1);
			$("#msg").html("");
		}
		if (visible==1 && dice[1][0]<=0 && dice[1][1]<=0) CancelDisabling(false);
		return(-dice[1][usableDice]);
	}
}

function SwitchDice(plr, visible) {
	if (currentPlayer<0) return(false);
	if (switchDisabled&&player[plr].human) return;
	if (plr!=currentPlayer) return(false);
	if ((visible==1)&&(!player[plr].human)) return(false);
	if ((visible==1)&&(!cancelDisabled)) return(false);
	document.getElementById("clickSnd").play();
	if (dice[plr][0]==dice[plr][3]) {
		var tmp=dice[plr][1];
		dice[plr][1]=dice[plr][2];
		dice[plr][2]=tmp;
	} else {
		if (dice[plr][0]>0 && dice[plr][1]>0) {
			var tmp=dice[plr][0];
			dice[plr][0]=dice[plr][1];
			dice[plr][1]=tmp;
			var tmp=dice[plr][1];
			dice[plr][1]=dice[plr][2];
			dice[plr][2]=tmp;
		} else {
			var tmp=dice[plr][1];
			dice[plr][1]=dice[plr][2];
			dice[plr][2]=tmp;
		}
	}
	if (visible>0) RefreshDice();
	return(true);
}

function HelpClick() {
	document.getElementById("clickSnd").play();
	alert("Rules of \"Holy War\" are largely similar to the rules of Backgammon.\n"+
			"To start the game and determine who moves first click on the \"Roll\" button.\n"+
			"During your turn, press \"Roll\" again to throw dices. First dice in \"dice row\" will be used while moving. To change order of dices click on the \"Switch\" button.\n"+
			"When you roll doubles, you get four identical dices. When you roll summar value 7 on two dices, you get third random dice.\n"+
			"To moves units click on a field with them.\n"+
			"After using all dices, click on the \"Turn\" button for accepting your actions, or \"Cancel\" button for cancelling actions and move again.\n"+
			"When you move unit on a field which is occupied by a single unit of the opponent then your unit kill him. Players can not move living units, while they not ressurect deads. For ressurecting you must click on your castle.\n"+
			"It is not possible to jump on a point which is occupied by more than one of the opponent's units.\n"+
			"The first player who moved off all of his units wins the game. You may attack enemy's castle only when all of yout units gathered within six fields before it. Player must then always bear off those units which require the highest possible move values.");
}

function Tutorial() {
	document.getElementById("clickSnd").play();
	$("#tutorial").show(1000);
}
function Tutorial_close() {
	document.getElementById("clickSnd").play();
	$("#tutorial").hide(1000);
}
function Tutorial_next() {
	document.getElementById("clickSnd").play();
	tutorialPage++;
	if (tutorialPage>7) tutorialPage=0;
	$("#illustration").attr("src",illustration[tutorialPage]);
	$("#text").html(text[tutorialPage]);
}
function Tutorial_prev() {
	document.getElementById("clickSnd").play();
	tutorialPage--;
	if (tutorialPage<0) tutorialPage=7;
	$("#illustration").attr("src",illustration[tutorialPage]);
	$("#text").html(text[tutorialPage]);
}
