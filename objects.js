/*
Developer: Emian Amanullah (emian@shuf.com)
Distributed under GNU GPL 2.
*/

// Constants and objects

var arrangement = { // Various starting positions
	"classic": [0, -2,0,0,0,0,5, 0,3,0,0,0,-5, 5,0,0,0,-3,0, -5,0,0,0,0,2, 0],
	"long": [0, -13,0,0,0,0,0, 0,0,0,0,0,-2, 2,0,0,0,0,0, 0,0,0,0,0,13, 0],
	"equal": [0, 0,0,0,-5,-5,-5, 0,0,0,0,0,0, 0,0,0,0,0,0, 5,5,5,0,0,0, 0],
	"pl1Def": [0, 0,0,0,0,-2,-3, 0,0,-3,-3,0,0, 2,2,-2,-2,2,2, 3,2,2,0,0,0, 0],
	"pl2Def": [0, 0,0,0,-2,-2,-3, -2,-2,2,2,-2,-2, 0,0,3,3,0,0, 3,2,0,0,0,0, 0],
	"camp1miss1": [0, -3,-3,-3,0,-2,-4, 0,0,0,0,0,0, 5,5,5,0,0,0, 0,0,0,0,0,0, 0],
	"camp1miss2": [0, 0,-1,-1,-1,-1,-1, -4,-2,-2,-2,2,0, 0,3,3,3,0,0, 2,2,0,0,0,0, 0],
	"camp1miss3": [0, -2,-2,-2,-2,-2,-2, 0,-1,-2,0,0,0, 0,3,3,3,3,3, 0,0,0,0,0,0, 0],
	"camp1miss4": [0, 0,0,0,-2,-3,-3, 0,-3,-2,-2,0,0, 3,3,2,2,0,0, 2,3,0,0,0,0, 0],
	"camp1miss5": [0, 0,0,0,-1,-1,-1, -4,-4,0,0,-2,-2, 2,2,2,0,0,5, 4,0,0,0,0,0, 0],
	"camp1miss6": [0, 0,0,0,-1,-3,-3, -1,-1,0,0,-3,-3, 2,2,2,1,1,1, 1,1,1,1,1,1, 0],
	"camp1miss7": [0, 0,0,0,-2,-2,-2, -1,2,-3,2,1,-1, -1,-2,3,2,-1,2, 0,0,0,0,1,2, 0]
}

var settings = {
	"custom": {'AI1':true, 'AI2':false, 'Fraction1': 0, 'Fraction2': 1, 'Map': 'map_river.gif'}
}

var campaigns = {
	1: {
		'title': 'Crusade',
		'brief': "<div class='brief_img'><img src='images/map.gif'></div>Возглавь армию доблестных крестоносцев в походе на святую землю!",
		'end': "<div class='brief_img'<img src='images/camp1end.jpg'></div>Преодолев все препятствия и ловушки хитрых сарацинов, вы наконе захватили Иерусалим и прочно укрепились в нем! Эпохахристианства на святой земле началась!",
		'lose': "<div class='brief_img'<img src='images/camp1lose.jpg'></div>Не смотря на все усилия, вам не удалось захватить Иерусалим. Но это лишь повод к новому крестовому походу!",
		'missions': {
			1: {
				'brief': "<div class='brief_img'><img src='images/map11.gif'></div>Со всей Европы собрались святые воины в Константинополе, полные рвения. Пора выступать! Первая цель - Никея.",
				'Fraction1': 1,
				'Fraction2': 0,
				'position': "camp1miss1",
				'map': "map_river.gif"
			},
			2: {
				'brief': "<div class='brief_img'><img src='images/map12.gif'></div>С легкостью овладев Никеей, армия крестоносцев продолжила свое наступление. На пути лег город Дорилей.",
				'Fraction1': 1,
				'Fraction2': 0,
				'position': "camp1miss2",
				'map': "map_hills.gif"
			},
			3: {
				'brief': "<div class='brief_img'><img src='images/map13.gif'></div>Ни что не могло остановить воинов Христовых! Более того, многие правители на пути сами оказывали им поддержку. Когда Малая Азия была уже позади, вдали показалась Антиохия - оплот сарацинов, который просто необходимо захватить.",
				'Fraction1': 1,
				'Fraction2': 0,
				'position': "camp1miss3",
				'map': "map_cross.gif"
			},
			4: {
				'brief': "<div class='brief_img'><img src='images/map14.gif'></div>Наконец Антиохия пала перед натиском крестоносцев, но сельджуки уже готовили контратаку, чтобы отбить ее. На защиту!",
				'Fraction1': 1,
				'Fraction2': 0,
				'position': "camp1miss4",
				'map': "map_desert.gif"
			},
			5: {
				'brief': "<div class='brief_img'><img src='images/map15.gif'></div>После очередной победы плотно обосновались в захваченом районе, но предстояло идти дальше, ведь Иерусалим уже близко. Тем не менее запасы иссякали, и для их пополнения необходимо захватить Маарру.",
				'Fraction1': 1,
				'Fraction2': 0,
				'position': "camp1miss5",
				'map': "map_desert.gif"
			},
			6: {
				'brief': "<div class='brief_img'><img src='images/map16.gif'></div>Решив больше не тратить силы, крестоносцы двинулись напрямую к Иерусалиму, и вскоре он предстал перед ними во всей красе. Пора выполнить свой священный долг и освободить этот великий город!",
				'Fraction1': 1,
				'Fraction2': 0,
				'position': "camp1miss6",
				'map': "map_desert.gif"
			},
			7: {
				'brief': "<div class='brief_img'><img src='images/map17.gif'></div>Иерусалим в ваших руках! Ни один иноверец больше не омрачает его своим присутствием! Но осталось доказать свое право на владение им - приближается войско фатимидов из Египта чтобы отбить его.",
				'Fraction1': 1,
				'Fraction2': 0,
				'position': "camp1miss7",
				'map': "map_desert_river.gif"
			}
		}
	},
	2: {
	},
	3: {
	}
}

var illustration = [
	//"images/tutorial0.gif",
	"images/tutorial1.gif",
	"images/tutorial2.gif",
	"images/tutorial3.gif",
	"images/tutorial4.gif",
	"images/tutorial5.gif",
	"images/tutorial6.gif",
	"images/tutorial7.gif"
];
var text = [
	//"Choose starting position, type of players and click <b>Start</b>.",
	"Click on the <b>Roll</b> (1) button to start the game. Then click <b>Turn</b> (2) button.",
	"Click on the <b>Roll</b> at your turn to throw dices.",
	"Click on the units to move them. Then click <b>Turn</b> button.",
	"<b>First dice</b> in <b>dice row</b> will be used while moving. To change order of dices click on the <b>Switch</b> button.",
	"It is not possible to jump on a point which is occupied by more than one of the opponent's units.",
	"When you move unit on a field which is occupied by a single unit of the opponent then your unit kill him. Players <b>can not move</b> living units, while they not ressurect deads. <b>For ressurecting</b> you must click on your castle.",
	"The first player who moved off all of his units wins the game. You may attack enemy's castle only when all of yout units gathered within six fields before it. Player must then always bear off those units which require the highest possible move values."
];

var fractions = ['saracens', 'crusarders', 'undeads'];

function Player(name, fraction, type) { // Player class
	this.name = name;
	this.fraction = fraction;
	this.human = type; // true - human control
}
