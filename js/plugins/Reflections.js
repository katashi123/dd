/*:
 *
 * @plugindesc Events/Characters reflections by region
 * @author Jake Jilg "mogwai"
 *
 
 Region 8 = Floor Reflection
 Region 9 = Vertical Mirror Reflection
 Region 10 = Vertical Mirror Base
 
 * version 0.3
 */
 
(function(alias){
	Spriteset_Map.prototype.createTilemap = function() {
		alias.apply(this, arguments);
		$gameMap._tileLayer = this._tilemap;
	};
})(Spriteset_Map.prototype.createTilemap);

(function(alias){
	Sprite_Character.prototype.initMembers = function() {
		alias.apply(this, arguments);
		this._southReflect = null;
		this._mirrorReflect = null;
	};
})(Sprite_Character.prototype.initMembers);

(function(alias){
	Sprite_Character.prototype.updateCharacterFrame = function() {
		alias.apply(this, arguments);
		if(this._southReflect === null){
			this._southReflect = new Sprite();
			this._southReflect.anchor.x = 0;
			this._southReflect.anchor.y = 0;
			
			this._southReflect.mask = new PIXI.Graphics();
			
			$gameMap._tileLayer.addChild(this._southReflect);
			$gameMap._tileLayer.addChild(this._southReflect.mask);
		}
		if(this._mirrorReflect === null){
			this._mirrorReflect = new Sprite();
			this._mirrorReflect.anchor.x = 0;
			this._mirrorReflect.anchor.y = 0;
			
			this._mirrorReflect.mask = new PIXI.Graphics();
			
			$gameMap._tileLayer.addChild(this._mirrorReflect);
			$gameMap._tileLayer.addChild(this._mirrorReflect.mask);
		}
	};
})(Sprite_Character.prototype.updateCharacterFrame);

(function(alias){
	Sprite_Character.prototype.updateHalfBodySprites = function() {
		alias.apply(this, arguments);
		
		var dx = ($gameMap._displayX || 0) * 48;
		var dy = ($gameMap._displayY || 0) * 48;
		
		var cx = Math.floor(this._character._realX);
		var cy = Math.floor(this._character._realY);
		var rx = this._character._realX;
		var ry = this._character._realY;
		
		var r = function(x,y){
			return $gameMap.regionId(cx + x, cy + y);
		};
		var region8 = [];
		var region9 = [];
		var region10y = -9999999;
		
		var rr = Math.round(Math.max(Graphics.width/2,Graphics.height/2)/48);
		for(var x = 0-rr; x < rr; x++){
			for(var y = 0-rr; y < rr; y++){
				if(r(x,y) === 8)
					region8.push([cx + x, cy + y]);
				if(r(x,y) === 9)
					region9.push([cx + x, cy + y]);
				if(r(x,y) === 10 && Math.abs((cy+y)-ry) < Math.abs(region10y-ry))
					region10y = cy + y;
			}
		}		
		var pw = this.patternWidth();
		var ph = this.patternHeight();
		
		if(this._southReflect !== null){
			this._southReflect.bitmap = this.bitmap;
			this._southReflect.scale.x =  1;
			this._southReflect.scale.y = -1;
			this._southReflect.x = rx * 48 - (pw - 48) / 2 - dx;
			this._southReflect.y = ry * 48 + ph + 48       - dy;
			this._southReflect.z = 0;
			
			this._southReflect.mask.clear();
			var masked = false;
			for(var i = 0; i < region8.length; i++){
				var x = region8[i][0] * 48   - dx;
				var y = (region8[i][1]) * 48 - dy;
				
				if(Math.hypot(cx-x,cy-y) < Math.max(pw,ph)) // draw mask only when near
					continue;
				masked = true;
				
				this._southReflect.mask.beginFill(0,0);
				this._southReflect.mask.moveTo( x     , y      );  // x,y  my math...
				this._southReflect.mask.lineTo( x     , y      );  // x,y  ____  x,y
				this._southReflect.mask.lineTo( x + 48, y      );  //     |    |
				this._southReflect.mask.lineTo( x + 48, y + 48 );  //     |____|
				this._southReflect.mask.lineTo( x     , y + 48 );  // x,y        x,y
			}
			this._southReflect.visble = masked;
		}
		if(this._mirrorReflect !== null){
			this._mirrorReflect.bitmap = this.bitmap;
			this._mirrorReflect.scale.x = -1;
			this._mirrorReflect.scale.y =  1;
			this._mirrorReflect.x = rx * 48 + 48 + Math.abs(48 - pw) / 2       - dx;
			this._mirrorReflect.y = (region10y + (region10y - ry)) * 48 - ph   - dy;
			this._mirrorReflect.z = 0;

			this._mirrorReflect.mask.clear();
			var masked = false;
			for(var i = 0; i < region9.length; i++){
				var x = region9[i][0] * 48     - dx;
				var y = (region9[i][1]) * 48   - dy;
				
				if(Math.hypot(cx-x,cy-y) < Math.max(pw,ph)) // draw mask only when near
					continue;
				masked = true;
				
				this._mirrorReflect.mask.beginFill(0,0);
				this._mirrorReflect.mask.moveTo( x     , y      );  // x,y  my math...
				this._mirrorReflect.mask.lineTo( x     , y      );  // x,y  ____  x,y
				this._mirrorReflect.mask.lineTo( x + 48, y      );  //     |    |
				this._mirrorReflect.mask.lineTo( x + 48, y + 48 );  //     |____|
				this._mirrorReflect.mask.lineTo( x     , y + 48 );  // x,y        x,y
			}
			this._mirrorReflect.visble = masked;
		}
	};
})(Sprite_Character.prototype.updateHalfBodySprites);

(function(alias){
	Sprite_Character.prototype.updateCharacterFrame = function() {
		alias.apply(this, arguments);
		
		var pw = this.patternWidth();
		var ph = this.patternHeight();
		
		var bx = this.characterBlockX();
		var by = this.characterBlockY();
		
		var sx = (bx + this.characterPatternX()) * pw;
		var sy = (by + this.characterPatternY()) * ph;
		
		if(this._southReflect !== null){
			this._southReflect.setFrame(sx, sy, pw, ph);
		}
		if(this.characterPatternY() - Math.round(this.characterPatternY()) !== 0)
			alert(this.characterPatternY());
		
		var smx = (bx + [2,1,0][this.characterPatternX()]) * pw;
		var smy = (by + [3,2,1,0][this.characterPatternY()]) * ph;
		
		if(this._mirrorReflect !== null){
			this._mirrorReflect.setFrame(smx, smy, pw, ph);
		}
	};
})(Sprite_Character.prototype.updateCharacterFrame);



