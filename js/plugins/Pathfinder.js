#===============================================================================
# Pathfinding & Event formations
# By Jet10985(Jet) & Venima
#===============================================================================
# This script will allow you to use a pathfinder to move players or events.
# Modification: This script will also allow you to use a pathfinder which 
# incorporates formation handling.
# This script has: 2 customization options.
#
# Modifications:
# Pathfinder:
# Goal location may now be inpassable, pathfinder will still reach it.
# Pathfinder still works "as intended" when the move route is set to repeat.
# Added parameter: distance (explained below).
# Added parameter: jump (set to true if the moves should be jumps instead of
# walking).
# Added parameter: commonEvent (provide the common event id for the pathfinder
# to run the event before each move (useful for adding sound or effects to 
# movements)
# Added parameters: 
# catchup (provide a value to indicate how far from the target the event 
#   should be before it speeds up its movement)
# catchupSpeed (provide a value for the speed when catching up)
# normalSpeed (provide a value for the speed after its caught up)
# Note: Pathfinder is a bit more processor heavy when used with a repeating 
# move route (it was useless before, so this is only a benefit)
# Formations:
# Added find_formation_path function
# Added turn_with_player function
#
#===============================================================================
# Overwritten Methods:
# None
#-------------------------------------------------------------------------------
# Aliased methods:
# None
#===============================================================================
=begin

===============================================================================
 Instructions:

===============================================================================
 Standard pathfinder:
-------------------------------------------------------------------------------

To move a player or event, use this in a move route's "Script..." command:

find_path(x, y, distance = 0, jump = false, commonEvent = 0, catchup = 0, 
      catchupSpeed = 5, normalSpeed = 4)

x is the target x

y is the targey y

distance is set to 0 by default and can be omitted to keep the default value.
While x and y represent the target location, the event will only be moved 
up to the specified distance from the target. This makes it easier to have 
an event follow the player, without getting in the player's way. This could 
be used as an alternative to following, except it works on any events, 
not just party members.

jump is set to false by default and can be omitted. Jump specifies that 
instead of the event "moving" to the target, the event will make small "jumps" 
to the target. If you specify jump, you cannot omit any previous parameters.

commonEvent is set to 0 by default and can be omitted. This specifies the 
id of a common event that you want executed before each move step. Currently
this only applies to repeating paths. When set to 0, no common event is called.
If you specify commonEvent you cannot omit any previous parameters.

catchup is set to 0 by default and can be omitted. Catchup specifies that if
the event is equal to or past the catchup distance, they will move faster to 
"catch up". Their speed becomes the catchUp speed. Once caught up, they will 
return to the normalSpeed. If you specify catchup you cannot omit any previous 
parameters.

catchupSpeed is set to 5 by default and can be omitted. It is used when catchup 
is specified to a value above 0. (see catchup for details). If you specify 
catchupSpeed you cannot omit any previous parameters.

normalSpeed is set to 5 by default and can be omitted. It is used when catchup 
is specified to a value above 0. (see catchup for details). If you specify 
normalSpeed you cannot omit any previous parameters.



Running the script outside of a move route (as a standalone script call)
has two extra parameters after x and y called "ev" and "wait" but has no 
commonEvent or catcup parameters.

find_path(x, y, ev = 0, wait = false, distance = 0, jump = false)

ev is set to 0 by default and can be omitted like so: find_path(9, 4).
Ev represents which character is to be moved. -1 is the player, 0 is the
calling event, and anything above is an event on the map whose ID is the ev.

wait is set to false by default and can be omitted like so: 
find_path(9, 4) or find_path(9, 4, -1)
find_path(x, y) or find_path(x, y, ev)
wait specifies if the player will have to wait for the move route to finish
to start moving again.

-------------------------------------------------------------------------------
 Examples:

Example of following the player at a distance:

In event's custom move route or specified move route (on repeat): 
  find_path($game_player.x, $game_player.y, 3)
  
Example of an event following an event with id 2 and catching up:
  find_path($game_events[2].x, $game_events[2].y, 0, false, 0, 3)

===============================================================================
 Formation handling:
-------------------------------------------------------------------------------

To move an event using a formation use this in a move route:

find_formation_path(followId, shiftX, shiftY, catchup = FORM_CATCHUP_DIST, 
      catchupSpeed = 5, normalSpeed = 4)
      
followId is the character that this event is in formation with. -1 = player,
0 = current event (although this is pointless) and above 0 is the event id.

shiftX is the relational x position from the followId character WHEN that 
character faces "down". If you enter -1, this event will move to the left if 
its facing down, or right if its facing up.

shiftY is the relational y position from the followId character WHEN that
character faces "down". If you enter -1, this event will move above if its 
facing down, or below if it's facing up.

catchup's default value is specified by the parameter FORM_CATCHUP_DIST and
can be omitted. This specifies how far behind this event can get before it 
speeds up to catch up.

catchupSpeed's default value is 5 and can be omitted. This specifies how fast 
this event will move when it's "catching up". If you specify catchupSpeed, you 
cannot omit any previous parameters.

normalSpeed's default value is 4 and can be omitted. This specifies how fast 
this event will move when it isn't "catching up". If you specify normalSpeed, 
you cannot omit any previous parameters.


You also have another command for formations:
Entering "turn_with_leader" as a separate script after find_formation_path
will cause the event to turn the same way the player is turned after arriving 
at their formation position.
Entering "turn_with_leader(1)" will turn the same way as event with id 1.
Turn_with_leader also has a second optional parameter. Entering "left" or -1
will turn this event left of the leader's direction, entering "right" or 1
will turn this event right of the leader's direction, and entering "back" or 2 
will turn this event opposite of the leader's direction. Again, if you specify 
this parameter, you cannot omit the previous one. 

-------------------------------------------------------------------------------
 Examples:

Example of 2 events acting similar to followers behind the player:
In a repeating move-route for Event 01:
find_formation_path(-1,0,-1)
In a repeating move_route for Event 02:
find_formation_path(1,0,-1)

Example of an event covering the player's back 2 spaces away:
In a repeating move-route:
find_formation_path(-1,0,-2)
turn_with_leader(-1,"back")

Example of an event with a formation determined by in-game variables:
In a repeating move-route:
find_formation_path(-1, $game_variables[1], $game_variables[2])

=end

#===============================================================================
# Customisation options below:
#===============================================================================
module Venima
  module Formations
    #
    FORM_CATCHUP_DIST = 3
  end
end

module Jet
  module Pathfinder
    
    # While mainly for coders, you may change this value to allow the
    # pathfinder more time to find a path. 1000 is default, as it is enough for
    # a 100x100 MAZE so, yeah.
    # Note from Venima, you probably don't want to change this value too much
    MAXIMUM_ITERATIONS = 500
    
  end
end
#===============================================================================
# Customisation end
#===============================================================================

class Node
  
  include Comparable

  attr_accessor :point, :parent, :cost, :cost_estimated

  def initialize(point)
    @point = point
    @cost = 0
    @cost_estimated = 0
    @on_path = false
    @parent = nil
  end

  def mark_path
    @on_path = true
    @parent.mark_path if @parent
  end
   
  def total_cost
    cost + cost_estimated
  end

  def <=>(other)
    total_cost <=> other.total_cost
  end
   
  def ==(other)
    point == other.point
  end
end

class Point
  
  attr_accessor :x, :y
  
  def initialize(x, y)
    @x, @y = x, y
  end

  def ==(other)
    return false unless Point === other
    @x == other.x && @y == other.y
  end

  def distance(other)
    (@x - other.x).abs + (@y - other.y).abs
  end

  def relative(xr, yr)
    Point.new(x + xr, y + yr)
  end
end

class Game_Map
  
  def each_neighbor(node, char = $game_player)
    x = node.point.x
    y = node.point.y
    nodes = []
    4.times {|i|
      i += 1
      new_x = round_x_with_direction(x, i * 2)
      new_y = round_y_with_direction(y, i * 2)
      next unless char.passable?(x, y, i * 2)
      #removed line below (technically, if your goal is an inpassable block,
      # e.g. an event, you can still reach it)
      #next unless char.passable?(new_x, new_y, 10 - i * 2)
      nodes.push(Node.new(Point.new(new_x, new_y)))
    }
    nodes
  end
  
  def find_path(tx, ty, sx, sy, dist, jump, char = $game_player)
    start = Node.new(Point.new(sx, sy))
    goal = Node.new(Point.new(tx, ty))
    return [] if start == goal or (dist > 0 and start.point.distance(goal.point) <= dist)
    return [] if ![2, 4, 6, 8].any? {|i| char.passable?(tx, ty, i) }
    open_set = [start]
    closed_set = []
    path = []
    iterations = 0
    loop do
      return [] if iterations == Jet::Pathfinder::MAXIMUM_ITERATIONS
      iterations += 1
      current = open_set.min
      return [] unless current
      each_neighbor(current, char).each {|node|
        if node == goal or (dist > 0 and node.point.distance(goal.point) <= dist)
          node.parent = current
          node.mark_path
          return recreate_path(node, jump)
        end
        next if closed_set.include?(node)
        cost = current.cost + 1
        if open_set.include?(node)
          if cost < node.cost
            node.parent = current
            node.cost = cost
          end
        else
          open_set << node
          node.parent = current
          node.cost = cost
          node.cost_estimated = node.point.distance(goal.point)
        end
      }
      closed_set << open_set.delete(current)
    end
  end
  
  def recreate_path(node, jump)
    path = []
    hash = {[1, 0] => 6, [-1, 0] => 4, [0, 1] => 2, [0, -1] => 8}
    until node.nil?
      pos = node.point
      node = node.parent
      next if node.nil?
      ar = [pos.x <=> node.point.x, pos.y <=> node.point.y]
      if jump
        path.push(RPG::MoveCommand.new(14,ar))
      else
        path.push(RPG::MoveCommand.new(hash[ar] / 2))
      end
    end
    return path
  end
end

class Game_Character
  
  #modified function (added handling for repeated move route (recalculates path 
  # each step so it doesn't just loop it's old path route and will revalidate  
  # if x or y changes, will follow variable value if x and y are set to it)
  def find_path(x, y, dist = 0, jump = false, commonEvent = 0, catchup = 0, catchupSpeed = 5, normalSpeed = 4)
    path = $game_map.find_path(x, y, self.x, self.y, dist, jump, self).reverse
    if !@move_route.repeat
      @move_route.list.delete_at(@move_route_index)
      @move_route.list.insert(@move_route_index, *path)
      @move_route_index -= 1
    elsif path.length > 0
      if commonEvent > 0
        $game_temp.reserve_common_event(commonEvent)
      end
      if catchup > 0
        if @move_speed < catchupSpeed && path.length >= catchup
          process_move_command(RPG::MoveCommand.new(29,[catchupSpeed]))
        elsif @move_speed >= catchupSpeed && path.length < 2
          process_move_command(RPG::MoveCommand.new(29,[normalSpeed]))
        end
      end
      process_move_command(path[0])
      @move_route_index -= 1
    end
    return path.length
  end

  def get_character(i)
    if i == -1
      return $game_player
    end
    if i == 0
      return $game_map.events[@event_id]
    end
    if i > 0
      return $game_map.events
    end
  end
  
  def find_formation_path(followId, shiftX, shiftY, catchup = Venima::Formations::FORM_CATCHUP_DIST, catchupSpeed = 5, normalSpeed = 4)
    x = shift_follow_x(followId, shiftX, shiftY)
    y = shift_follow_y(followId, shiftX, shiftY)
    if find_path(x,y,0,false,0,catchup,catchupSpeed,normalSpeed) == 0
      char = get_character(followId)
      find_path(char.x,char.y,3,false,0,catchup,catchupSpeed,normalSpeed)
    end
  end
  
  def shift_follow_x(followId, shiftX, shiftY)
    char = get_character(followId)
    case char.direction
    when 2
      return char.x + shiftX
    when 4
      return char.x - shiftY
    when 6
      return char.x + shiftY
    when 8
      return char.x - shiftX
    end
    return char.x
  end
  
  def shift_follow_y(followId, shiftX, shiftY)
    char = get_character(followId)
    case char.direction
    when 2
      return char.y + shiftY
    when 4
      return char.y - shiftX
    when 6
      return char.y + shiftX
    when 8
      return char.y - shiftY
    end
    return char.y
  end
  
  def turn_with_leader(eventId = -1, dirmod = "")
    dir = get_character(eventId).direction
    mod = 0
    if dirmod == "left" || dirmod == -1
      case dir
      when 2
        set_direction(4)
      when 4
        set_direction(2)
      when 6
        set_direction(8)
      when 8
        set_direction(6)
      end
    elsif dirmod == "right" || dirmod == 1
      case dir
      when 2
        set_direction(6)
      when 4
        set_direction(8)
      when 6
        set_direction(2)
      when 8
        set_direction(4)
      end
    elsif dirmod == "back" || dirmod == 2
      case dir
      when 2
        set_direction(8)
      when 4
        set_direction(6)
      when 6
        set_direction(4)
      when 8
        set_direction(2)
      end
    else
      set_direction(dir) 
    end
  end
end
 
class Game_Interpreter
  
  #modified line below (added distance parameter)
  def find_path(x, y, ev = 0, wait = false, dist = 0, jump = false)
    char = get_character(ev)
    #modified line below (added distance parameter)
    path = $game_map.find_path(x, y, char.x, char.y, dist, jump, char)
    path.reverse!
    path.push(RPG::MoveCommand.new(0))
    route = RPG::MoveRoute.new
    route.list = path
    route.wait = wait
    route.skippable = true
    route.repeat = false
    char.force_move_route(route)
  end
end