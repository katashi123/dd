//-----------------------------------------------------------------------------
// James Westbrook's Distance Conditional
// Version 1.0
var Imported = Imported || {};
Imported.JMW_DistanceConditional = true;

var JMW = JMW || {};                // Main object
JMW.DC = JMW.DC || {};  // Plugin object

/*:
 * @plugindesc Version 1.0 Checks how close the event is to the player/ another event.
 * 
 * @author James Westbrook 1.0
 *
 * @param
 * @desc
 * @default
 *
 * @help
 *Credits: James Westbrook for writing plugin, and Galv for
 *assisting James in writing his first plugin.
 *(find Galv at galvs-scripts.com)
 *Allowed for any use. Credit not necessary since this
 *is one of the easiest plugins to make.
 *
 * Normally when determining the distance between the player and an event(or an 
 *event with another event), you need four lines of scripting that you will have 
 *to insert into a conditional command. This plugin allows you to need only 
 *one line!
 *
 *Uses for this plugin:
 *You can use this plugin to determine if the player is close enough to an 
 *event to meet the distance requirement. You are able to modify this distance 
 *number to suit your needs. You can also use it with two different events, 
 *instead of with a player. 
 *
 *Script Calls:
 *You can put either of the scripts in a conditional event.
 *
 *JMW.checkDist(eventID, X distance)
 *
 *JMW.checkEventsDist(eventNumber1, eventNumber2, distance)
 *
 *(read later in help for further instructions
 * on how to use these calls)
 *
 *The first is used when you want the condition to be if 
 *the player is X close to the event. In "eventID" 
 *you fill in what the event's ID is. 
 *In "X distance" you fill in the distance you
 *want. For example if I put "JMW.checkDist(4, 5)"
 *, it would make the conditional would only
 *be met if the player was within 5 spaces
 *of event 4!
 *
 *The second script can be used to determine
 *if two events were within X range. For 
 *example, if I put "JMW.checkEventsDist(7, 8, 5)"
 * if events 7 and 8 were within 5 spaces, the
 condition is met.
 *The exact place you will be using these SCRIPT
 *commands is found in the first tab when making
 * an event. Under "Flow Control", select
 *"Conditional Branch". Go to the fourth
 *tab. At the bottom is the script option.
 *Click onto the word "Script" and then
 fill in the box with your script call!
 *For a visual aid, refer to my Distance
 *Conditional Demo!
 * 
 *
 */
    

(function() {
   

JMW.checkDist = function(eventNumber, playerDistance) {
return $gameMap.event(eventNumber)._x > $gamePlayer._x - playerDistance && $gameMap.event(eventNumber)._x < $gamePlayer._x + playerDistance && $gameMap.event(eventNumber)._y > $gamePlayer._y - playerDistance && $gameMap.event(eventNumber)._y < $gamePlayer._y + playerDistance
};

JMW.checkEventsDist = function(eventFirst, eventSecond, distanceSecond) {
    return $gameMap.event(eventFirst)._x > $gameMap.event(eventSecond)._x - distanceSecond && $gameMap.event(eventFirst)._x < $gameMap.event(eventSecond)._x + distanceSecond && $gameMap.event(eventFirst)._y > $gameMap.event(eventSecond)._y - distanceSecond && $gameMap.event(eventFirst)._y < $gameMap.event(eventSecond)._y + distanceSecond
};
    
	


})();