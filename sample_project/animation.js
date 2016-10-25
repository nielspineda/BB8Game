// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), B_thrust = vec3(),	looking = false, prev_time = 0, animate = false, animation_time = 0, camPos = -1, aerialCam = false, intro = 0, introPlayed = false;
		var gouraud = false, color_normals = false, solid = false, text_multiplier = 20;;
            var bb8_x = 0, bb8_y = 0, bb8_z=0, bb_stack = [],  key0up = true,  key1up = true, key2up= true, cam_x = 0, cam_y=0, cam_z= 0; //bb8_transform = mat4(); 
                var obs1 = [20, 0, -120], obs2 = [-10, 0, -40], obs3 = [-3, 0, -150], obs4 = [-20, 0, -300], bb8_pos = [0, 0, 0], testvec= mat4(), score = 0, scoresound = 1; //[1, 1, 1, 1];
                    var miss = 0;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); }


// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "stars.png", "text.png", "earth.gif", "BB8Text.png", "BB8TextHead.png", "sand1.png", "BB8bod.png", "BB8head.png", "Space1.png", "Volcano.png", "r2d2.png", "blueplanet.png", "DeathStar.png", "hexgrid.png", "MetalGrid.png"];

//Audio Files
var audio = new Audio("Song1.mp3");
var a_roll = new Audio("BB8Roll.mp3");
a_roll.loop = false;
var a01 = new Audio("01Hit.mp3");
a01.loop = false;
var a02 = new Audio("02Hit.mp3");
a02.loop = false;
var a03 = new Audio("03Hit.mp3");
a03.loop = false;
var a04 = new Audio("04Hit.mp3");
a04.loop = false;

var C3B1 = new Audio("C3B1.mp3");
C3B1.loop = false;
var C3B2 = new Audio("C3B2.mp3");
C3B2.loop = false;
var C3G1 = new Audio("C3G1.mp3");
C3G1.loop = false;
var C3G2 = new Audio("C3G2.mp3");
C3G2.loop = false;
var OOB = new Audio("OutOfBounds.mp3");
OOB.loop = false;
var isong = new Audio("intro.mp3");
isong.loop = false;


var rgbVec = function(R, G, B, alpha)
{
  return vec4( R/255.0, G/255.0, B/255.0, alpha/255.0);  
}

var FPS;
var t_star1 = new Material( vec4( .233,1, .081, .8), .2, .5, .8, 10);
var t_star2 = new Material ( rgbVec(255,5,10, 200), .3, .6, .9, 40);
var t_star3 = new Material ( rgbVec(255,255,25, 255), .2, .5, .8, 70);
//var t_star1;// = new Material ( rgbVec(57,255,20, 200), .2, .5, .8, 10);
// *******************************************************	
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self) 
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );
		
		gl.clearColor( .05, 0, .3, 1 );			// Background color
		
		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );
		
		self.m_cube = new cube();
		self.m_obj = new shape_from_file( "bb8.obj" );
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 4 );	
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );
        
        //Two Shapes Made In Blender!!
        self.m_star = new shape_from_file("Star5.obj");
        self.m_star2 = new shape_from_file("DoubleStar.obj");
        self.m_multiStar = new shape_from_file("MultiStar.obj");
        self.m_multiStar2 = new shape_from_file("MultiStar2.obj");
        self.m_starVader = new shape_from_file("VaderStar.obj");
        self.m_title = new shape_from_file("StarWars.obj");
        self.m_intro = new shape_from_file("introtext.obj");
        //Shape Made via OpenGL
        self.m_upperLeg = new upper_leg(20, mat4() ); 
        
        //Found from Online
        self.m_tie = new shape_from_file("tie2.obj");
        self.m_head = new shape_from_file( "BB8HEAD.obj" );
        self.m_r2d2 = new shape_from_file("r2d2.obj");
        self.m_c3po = new shape_from_file("c3po.obj");
        
        self.m_windmill = new windmill(3);
		self.m_capcylinder = new capped_cylinder();
        
		// 1st parameter is camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, 0,-40), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );

		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);
		
		self.context.render();	
	} ) ( this );	
	
	canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } );
	shortcut.add( ",",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;
	shortcut.add( ".",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;

	shortcut.add( "r",     ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
	shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);	
																		gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; intro = 1; } );
	
	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );	
    
    //Following Code added for movement of object
    shortcut.add( "up", function() { B_thrust[1] =  1; } );			shortcut.add( "up", function() { B_thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "down",     function() { B_thrust[1] =  -1; } );			shortcut.add( "down",     function() { B_thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "left",     function() { B_thrust[2] =  1; } );			shortcut.add( "left",     function() { B_thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "right",     function() { B_thrust[0] =  1; } );			shortcut.add( "right",     function() { B_thrust[0] =  0; }, {'type':'keyup'} );
    
    shortcut.add( "pageup",     function() { camPos =  1; } );			shortcut.add( "pageup",     function() { camPos =  0; }, {'type':'keyup'} );
    shortcut.add( "pagedown",     function() { camPos =  -1; } );			shortcut.add( "pagedown",     function() { camPos =  0; }, {'type':'keyup'} );
    
    //For Keyboard Without Page up or Down
    shortcut.add( ",",     function() { camPos =  1; } );			shortcut.add( ",",     function() { camPos =  0; }, {'type':'keyup'} );
    shortcut.add( ".",     function() { camPos =  -1; } );			shortcut.add( ".",     function() { camPos =  0; }, {'type':'keyup'} );
    
    //shortcut.add( "enter",     function() { intro =  1; } );			shortcut.add( "enter",     function() { intro =  -1; }, {'type':'keyup'} );
}

function update_camera( self, animation_delta_time )
	{        
        var leeway = 70, border = 50;
		var degrees_per_frame = .0002 * animation_delta_time;
		var meters_per_frame  = .01 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;
		
		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}


/*var rgbVec = function(R, G, B, alpha)
{
  return vec4( R/255.0, G/255.0, B/255.0, alpha/255.0);  
}*/

// *******************************************************	
// display(): called once per frame, whenever OpenGL decides it's time to redraw.
Animation.prototype.periodicMotion = function (model_transform, swayPivot, period) //previous tree Move
{
    //Taken out.  Turns out, will need this for both tree and WASP motion.
    //var period = 2000; //Likely to change. ~20 seconds to complete period, so 2000? 2000/4 = 5 second for each quarter movement.
    //var swayPivot= 2; 
    var time = this.graphicsState.animation_time % period; //Want to go based off of period
    var swaySpeed= period/ 4/ swayPivot; 
    
    //For loop change for 4 different positions/ways it can be rotating depending on time. CCW?  Double check on this
    
    if(time >= 0 && time < period/4) //First Quarter Movement: M->L
    {
        model_transform = mult(model_transform, rotation(time/swaySpeed, 0, 0, 0.5)); //Move from mid->left (2 degrees around Z axis)
    }
    else if(time >= period/4 && time < period/2) //Second Quarter Movement: L-> M
    {
        model_transform = mult(model_transform, rotation( (((time-period/4)/ -swaySpeed) + swayPivot), 0, 0, 1)); //Return to middle
    }
    else if(time >= period/2 && time < (3/4) * period) //Third Quarter Movement: M-> R
    {
        model_transform = mult(model_transform, rotation( ((time-period/2)/ -swaySpeed), 0, 0, 1));
    }
    else if(time >= (3/4)* period) //Final movement: Return to origin
    {
        model_transform = mult(model_transform, rotation( ((time - (3/4)* period) / swaySpeed - swayPivot), 0, 0, 1));
    }
    
    return model_transform; 
    
}

//Two Level Hierarchical Object: Head & Body of BB8

Animation.prototype.BB8 = function ( model_transform, animation_delta_time, cam)
{
    //This function will split making the leg into two parts; the upper leg and bottom leg
    
    var aliceblue = new Material ( rgbVec(240,248,255, 200), 1, 1, 1, 40);
    var BB8_bod = new Material( vec4( .6,.6,.6, 1 ), .4, .7, .5, 40, "BB8bod.png");
    var BB8_head = new Material( vec4( .6,.6,.6, 1 ), .4, .7, .5, 40, "BB8head.png");
    
    var stack = [];     
    var originalModel = model_transform;
    var body_transform = model_transform;
    var head_transform = mult(model_transform, translation(.6, 1.5, 0));
    
    //body_transform = mult( model_transform, rotation( this.graphicsState.animation_time/2, -1, 0, 0 ) ); //BB8 Always Spinning Forward
    //Movement
    if(animate && aerialCam == false && introPlayed == true) //Check this so you can only move when animation is ON
    {    
        
        
        if(B_thrust[2] == 1 && bb8_pos[0] > -22.87) //Move Left
        {
            a_roll.play();
            bb8_pos[0] = bb8_pos[0] - .5; 
            model_transform = mult( translation( 0, bb8_y, bb8_z ), model_transform );
            body_transform = mult( model_transform, rotation( this.graphicsState.animation_time, 0, 0, 1 ) ); 
            key2up = false;
        }
        
        if(B_thrust[2] == 0 && key1up == false)
        {
            key2up = true;
            a_roll.play();
        }

        if(B_thrust[0] == 1 && bb8_pos[0] < 22.87) //Move Right
        {
            a_roll.play();
            bb8_pos[0] = bb8_pos[0]  + .5; 
            model_transform = mult( translation( 0, bb8_y, bb8_z ), model_transform );
            body_transform = mult( model_transform, rotation( this.graphicsState.animation_time, 0, 0, -1 ) );
            key0up = false;
        }
        
        if(B_thrust[0] == 0 && key1up == false)
        {
            key0up = true;
            a_roll.play();
        }
    }
    
    //Head
    
    this.m_head.draw( this.graphicsState, head_transform, BB8_head );
    
    //Body
    body_transform = mult( body_transform, scale(2, 2, 2));
    this.m_sphere.draw( this.graphicsState, body_transform, BB8_bod );	
        
    return originalModel;
}

Animation.prototype.ground = function(model_transform)
{
    var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
    var sand = new Material( vec4( .5,.5,.5, 10 ), .55, .5, .5, 40, "sand1.png" )
    var grid = new Material( vec4( .6,.6,.6, .9 ), .4, 0.7, 0.1, 40, "MetalGrid.png" )
    var grid2 = new Material( vec4( .3,.3,.3, 1 ), .4, 0.9, 0.1, 40, "MetalGrid.png" )
    var c3 = new Material ( rgbVec(218,165,32, 255), .2, .9, .8, 70);
    var r2 = new Material( vec4( .8, .8 , 1, 1 ), .3, 1, 1, 40, "r2d2.png" );
    var yellowbox = new Material ( rgbVec(225,225,20, 150), .7, .4, .5, 100);
    var vRed = new Material ( rgbVec(255,10,10, 200), 1, 1, 1, 40);
    var plat3 = new Material ( rgbVec(10,10,255, 100), .5, 1, .5, 40);
    var plat = new Material ( rgbVec(192,192,192,  245), .5, 1, .5, 40);
    var plat2 = new Material ( rgbVec(112,128,144, 245), .5, 1, .5, 40);
    //var space1 = new Material( vec4( 0,0,0,1 ), .5, 1, 1, 40, "Space1.png" );
    var stack = [];
    
    var vader_transform = model_transform;
    vader_transform = mult( vader_transform, translation( -50, -10, -400) );
    vader_transform = mult( vader_transform, scale( 10, 10, 10) );
    vader_transform = mult( vader_transform, rotation( 5, 0, 1, 0 ) )
    this.m_starVader.draw( this.graphicsState, vader_transform, vRed);
    
    var star_transform = model_transform;
    star_transform = mult( star_transform, translation( 0, -20, -300) );
    stack.push(star_transform);
    star_transform = mult( star_transform, scale( 10, 10, 10) );
    //this.m_multiStar2.draw( this.graphicsState, star_transform, yellowbox);
    this.m_multiStar2.draw( this.graphicsState, star_transform, yellowbox);
    star_transform = mult( star_transform, translation (0, -5, 0) );
    this.m_multiStar2.draw( this.graphicsState, star_transform, yellowbox);
    star_transform = mult( star_transform, translation (0, -4, -5) );
    //star_transform = mult( star_transform, scale( .6, .6, .6) );
    this.m_multiStar2.draw( this.graphicsState, star_transform, yellowbox);
    star_transform = stack.pop();
    star_transform = mult( star_transform, translation( 0, 0, -50) );
    star_transform = mult( star_transform, scale( 6, 6, 6) );
    this.m_multiStar2.draw( this.graphicsState, star_transform, yellowbox);
    
   
    
    var ground_transform = model_transform; 
    ground_transform = mult( ground_transform, translation( 0, -2, 0) );
    ground_transform = mult( ground_transform, scale( 50, .1, 10) );
    this.m_cube.draw( this.graphicsState, ground_transform, grid );
    ground_transform = mult( ground_transform, scale( 1.3, .1, 1.5) );
    this.m_cube.draw( this.graphicsState, ground_transform, grid2 );
    ground_transform = mult( ground_transform, scale( 1.1, 1, 1.1) );
    this.m_cube.draw( this.graphicsState, ground_transform, plat3 );
    
    
    model_transform =  mult( model_transform, translation( -28, -2, -3) );
    stack.push(model_transform);
    model_transform = mult( model_transform, scale( 2.5, 2.5, 2.5) );
    //this.m_r2d2.draw(this.graphicsState, model_transform, r2);
    model_transform = mult( model_transform, rotation( 75, 0, 1, 0 ) )
    this.m_c3po.draw(this.graphicsState, model_transform, c3);
    
    /*model_transform = stack.pop();
    model_transform =  mult( model_transform, translation( 0, 0, 3) );
    model_transform = mult( model_transform, scale( 2.5, 2.5, 2.5) );
    model_transform = mult( model_transform, rotation( 60, 0, 1, 0 ) )
    this.m_r2d2.draw(this.graphicsState, model_transform, r2);*/
    
    return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

//2 Hierarchical 
Animation.prototype.planet = function(model_transform)
{
    var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
    var t_planet = new Material( vec4( .3 ,0 ,0, 10 ), .4, .6, .9, 40, "Volcano.png" );
    var t_planet2 = new Material( vec4( .2,.2,.5, .6 ), .7, .6, .9, 50, "blueplanet.png" );
    var yellowbox = new Material ( rgbVec(255,255,20, 100), 1, 1, 1, 40);
    var greyPlastic = new Material( vec4( .5,.5,.5, 1 ), 1, 1, 1, 200 );
    //var space1 = new Material( vec4( 0,0,0,1 ), .5, 1, 1, 40, "Space1.png" );
    var stack = [];
    
    var ground_transform = model_transform; 
    
    
    ground_transform = mult( ground_transform, translation( 240, 6, -500) );
    stack.push(ground_transform);
    ground_transform = mult( ground_transform, scale( 150, 150, 150) );
    ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/50, 0, .8, .2 ) )
    this.m_sphere.draw( this.graphicsState, ground_transform, t_planet2 );
    
    ground_transform = stack.pop();
    ground_transform = mult( ground_transform, translation( 10, 0, 60) );//Moving him
    ground_transform = mult( ground_transform, scale( 1/15, 1/15, 1/15) );
    ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/20, 0, -100, .2 ) )
    ground_transform = mult( ground_transform, translation( -2500, 0, 60) ); //Range of rotation (how big loop is)
    this.m_tie.draw(this.graphicsState, ground_transform, greyPlastic);
    
    
    //ground_transform = mult( ground_transform, scale( 1/50, 1/50, 1/50) );
    
    
    return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

// 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
Animation.prototype.planet2 = function(model_transform)
{
    var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
    var t_planet = new Material( vec4( .3 ,0 ,0, 10 ), .4, .6, .9, 40, "Volcano.png" );
    var t_planet2 = new Material( vec4( .8 ,.8 ,.8, 10 ), .4, .6, .9, 40, "DeathStar.png" );
    var yellowbox = new Material ( rgbVec(255,255,20, 100), 1, 1, 1, 40);
    var greyPlastic = new Material( vec4( .5,.5,.5, 1 ), 1, 1, 1, 200 );
    //var space1 = new Material( vec4( 0,0,0,1 ), .5, 1, 1, 40, "Space1.png" );
    var stack = [];
    
    var ground_transform = model_transform; 
    
    
    ground_transform = mult( ground_transform, translation( -400, 6, -800) );
    stack.push(ground_transform);
    ground_transform = mult( ground_transform, scale( 100, 100, 100) );
    ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/40, 0, .8, .2 ) )
    this.m_sphere.draw( this.graphicsState, ground_transform, t_planet2 );
    
    ground_transform = stack.pop();
    ground_transform = mult( ground_transform, translation( 10, 0, 60) );//Moving him
    ground_transform = mult( ground_transform, scale( 1/15, 1/15, 1/15) );
    ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/20, 0, -100, .2 ) )
    ground_transform = mult( ground_transform, translation( 2200, 0, 60) ); //Range of rotation (how big loop is)
    this.m_tie.draw(this.graphicsState, ground_transform, greyPlastic);
    
    
    //ground_transform = mult( ground_transform, scale( 1/50, 1/50, 1/50) );
    
    
    return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

Animation.prototype.obs1 = function ( model_transform, time)
{
        var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
        var redbox = new Material ( rgbVec(57,255,20, 200), .2, .5, .8, 10);
        
        var ground_transform = model_transform; 
        //obs1[0] = 20;
        ground_transform = mult( translation( obs1[0], 1.3, 0), ground_transform );
        ground_transform = mult( ground_transform, scale( 1.3, 1.3, 1.3) );
        
        if(animate && aerialCam == false && introPlayed == true){ //Pauses the game when up, no cheating though! You can't see anything falling! 
            
            if(obs1[2] < 5) //It's going to move at you
                {
                obs1[2] = obs1[2] + .4; 
                ground_transform = mult( ground_transform, translation( 0, obs1[1], obs1[2]) );
                ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/10, 1, 1, 0 ) );
                }
            
            //SIMPLE COLLISION DETECTION!!
            if( Math.abs(obs1[2] - bb8_z) < 1 && Math.abs(obs1[1]-bb8_y) < .001 && Math.abs(obs1[0]-bb8_pos[0]) < 2.5)
               {
                obs1[2] = -90 + (Math.random() * -20);
                obs1[0] = -20 + (Math.random() * 40);
                a01.play();
                score+=2;
                if(scoresound % 10 == 0)
                {
                    if(Math.random() < .5)
                        C3G1.play();
                    else    
                        C3G2.play();
                }
                scoresound++;
                ground_transform = mult( ground_transform, translation( 0, obs1[1], obs1[2]) );
                t_star1 = new Material( vec4( Math.random(), Math.random(), Math.random(), Math.random() ), Math.random(), Math.random(), Math.random(), Math.random() * 255 );
                }
            if(obs1[2] > 5)
                {
                obs1[2] = -90 + (Math.random() * -20);
                obs1[0] = -20 + (Math.random() * 40);
                if( miss%7 == 0){
                    if( Math.random() < .5)
                        C3B1.play();
                    else    
                        C3B2.play();
                }
                miss +=1; //Increment the number of misses
                ground_transform = mult( ground_transform, translation( 0, obs1[1], obs1[2]) );
                t_star1 = new Material( vec4( Math.random(), Math.random(), Math.random(), Math.random() ), Math.random(), Math.random(), Math.random(), Math.random() * 255 );
                }
        
        this.m_star2.draw( this.graphicsState, ground_transform, t_star1 );
        }
        return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

Animation.prototype.obs2 = function ( model_transform, time)
{
        var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
        var bluebox = new Material ( rgbVec(255,5,10, 200), .3, .6, .9, 40);
        
        var ground_transform = model_transform; 

        ground_transform = mult( translation( obs2[0], 1.3, 0), ground_transform );
        ground_transform = mult( ground_transform, scale( 1.3, 1.3, 1.3) );
        var speedup = .2;
    
        if(animate && aerialCam == false && introPlayed == true){ //Pauses the game when up, no cheating though! You can't see anything falling! 
            
            if(obs2[2] < 5) //It's going to move at you
                {
                obs2[2] = obs2[2] + speedup; 
                ground_transform = mult( ground_transform, translation( 0, obs2[1], obs2[2]) );
                ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/10, 0, 1, 1 ) );
                }
            
            //SIMPLE COLLISION DETECTION!!
            if( Math.abs(obs2[2] - bb8_z) < 1 && Math.abs(obs2[1]-bb8_y) < .001 && Math.abs(obs2[0]-bb8_pos[0]) < 2.5)
               {
                obs2[2] = -100 + (Math.random() * -40);
                obs2[0] = -20 + (Math.random() * 40);
                a02.play();
                score++;
                if(scoresound %10 == 0)
                {
                    if(Math.random() < .5)
                        C3G1.play();
                    else    
                        C3G2.play();
                }
                scoresound++;
                ground_transform = mult( ground_transform, translation( 0, obs2[1], obs2[2]) );
                t_star2 = new Material( vec4( Math.random(), Math.random(), Math.random(), Math.random() ), Math.random(), Math.random(), Math.random(), Math.random() * 255 );
                speedup = .1 + Math.random();
                }
            if(obs2[2] > 5)
                {
                obs2[2] = -100 + (Math.random() * -40);
                obs2[0] = -20 + (Math.random() * 40);
                if( miss%7 == 0){
                    if( Math.random() < .5)
                        C3B1.play();
                    else    
                        C3B2.play();
                }
                miss +=1; //Increment the number of misses
                ground_transform = mult( ground_transform, translation( 0, obs2[1], obs2[2]) );
                t_star2 = new Material( vec4( Math.random(), Math.random(), Math.random(), Math.random() ), Math.random(), Math.random(), Math.random(), Math.random() * 255 );
                speedup = .1 + Math.random();
                }
        
        this.m_star.draw( this.graphicsState, ground_transform, t_star2 );
        }
        return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

Animation.prototype.obs3 = function ( model_transform, time)
{
        var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
        //var greenbox = new Material ( rgbVec(10,255,10, 100), 1, 1, 1, 40);
        var space1 = new Material( vec4( .1,.3,.3,1 ), .5, 1, 1, 40, "Space1.png" );
    
        var ground_transform = model_transform; 
        //obs3[0] = -3;
        ground_transform = mult( translation( obs3[0], 1.3, 0), ground_transform );
        ground_transform = mult( ground_transform, scale( 1.3, 1.3, 1.3) );
        var speedup = .4;
    
        if(animate && aerialCam == false && introPlayed == true){ //Pauses the game when up, no cheating though! You can't see anything falling! 
            
            if(obs3[2] < 5) //It's going to move at you
                {
                obs3[2] = obs3[2] + speedup; 
                ground_transform = mult( ground_transform, translation( 0, obs3[1], obs3[2]) );
                ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/10, -.5, .7, 0 ) );
                }
            
            //SIMPLE COLLISION DETECTION!!
            if( Math.abs(obs3[2] - bb8_z) < 1 && Math.abs(obs3[1]-bb8_y) < .001 && Math.abs(obs3[0]-bb8_pos[0]) < 2.5)
               {
                obs3[2] = -100 + (Math.random() * -60);
                obs3[0] = -20 + (Math.random() * 40);
                a03.play();
                score+=3;
                if(scoresound % 10 == 0)
                {
                    if(Math.random() < .5)
                        C3G1.play();
                    else    
                        C3G2.play();
                }
                scoresound++;
                ground_transform = mult( ground_transform, translation( 0, obs3[1], obs3[2]) );
                ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/10, 0, 1, 1 ) );
                speedup = .4 + Math.random();
                }
            if(obs3[2] > 5)
                {
                obs3[2] = -100 + (Math.random() * -60);
                obs3[0] = -20 + (Math.random() * 40);
                if( miss%7 == 0){
                    if( Math.random() < .5)
                        C3B1.play();
                    else    
                        C3B2.play();
                }
                miss +=1; //Increment the number of misses
                ground_transform = mult( ground_transform, translation( 0, obs3[1], obs3[2]) );
                ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/10, 0, 1, 1 ) );
                speedup = .4 + Math.random();
                }
        
        this.m_star.draw( this.graphicsState, ground_transform, space1 );
        }
        return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

Animation.prototype.obs4 = function ( model_transform, time)
{
        var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
        var yellowbox = new Material ( rgbVec(255,255,25, 255), .2, .5, .8, 70);
        
        var ground_transform = model_transform; 
        //obs3[0] = -3;
        //ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time, 0, 1, 0 ) );
        ground_transform = mult( translation( obs4[0], 1.3, 0), ground_transform );
        ground_transform = mult( ground_transform, scale( 1.3, 1.3, 1.3) );
        var speedup = .7;
        
        if(animate && aerialCam == false && introPlayed == true){ //Pauses the game when up, no cheating though! You can't see anything falling! 
            
            if(obs4[2] < 5) //It's going to move at you
                {
                obs4[2] = obs4[2] + speedup; 
                ground_transform = mult( ground_transform, translation( 0, obs4[1], obs4[2]) );
                ground_transform = mult( ground_transform, rotation( this.graphicsState.animation_time/10, 0, -1, 0 ) );
                }
            
            //SIMPLE COLLISION DETECTION!!
            if( Math.abs(obs4[2] - bb8_z) < 1 && Math.abs(obs4[1]-bb8_y) < .001 && Math.abs(obs4[0]-bb8_pos[0]) < 2.5)
               {
                obs4[2] = -100 + (Math.random() * -150);
                obs4[0] = -20 + (Math.random() * 40);
                a04.play();
                score+=5;
                if(scoresound %10 == 0)
                {
                    if(Math.random() < .5)
                        C3G1.play();
                    else    
                        C3G2.play();
                }
                scoresound++;
                ground_transform = mult( ground_transform, translation( 0, obs4[1], obs4[2]) );
                t_star3 = new Material( vec4( Math.random(), Math.random(), Math.random(), Math.random() ), Math.random(), Math.random(), Math.random(), Math.random() * 255 );
                speedup = .6 + Math.random();
                }
            if(obs4[2] > 5)
                {
                obs4[2] = -100 + (Math.random() * -200);
                obs4[0] = -20 + (Math.random() * 40);
                if( miss%7 == 0){
                    if( Math.random() < .5)
                        C3B1.play();
                    else    
                        C3B2.play();
                }
                miss ++; //Increment the number of misses
                ground_transform = mult( ground_transform, translation( 0, obs4[1], obs4[2]) );
                t_star3 = new Material( vec4( Math.random(), Math.random(), Math.random(), Math.random() ), Math.random(), Math.random(), Math.random(), Math.random() * 255 );
                speedup = .6 + Math.random();
                }
        
        //ground_transform = mult( model_transform, rotation( 90, 0, 1, 0 ) );			// Example Rotate. 1st parameter is scalar for angle, last three are axis of rotation.
        this.m_star2.draw(this.graphicsState, ground_transform, t_star3);
        }
        return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

Animation.prototype.introduction = function (model_transform, time)
{
    var oModel = model_transform;
    var text_transform = model_transform;
    text_transform = mult( text_transform, translation( 0, -49, 0) );
    text_transform = mult( text_transform, rotation( 25, 1, 0, 0 ) );
    var textColor = new Material ( rgbVec(255,163, 0, 255), 1, .5, .5, 70);
    //var multiplier = 20;
    
    if(this.graphicsState.animation_time/1000 > 1.5)
    {
        model_transform = mult( model_transform, translation( 0, 0, (this.graphicsState.animation_time/1000 - 1.5)* 60) );
    }
    
    if(this.graphicsState.animation_time/1000 > 4.75)
    {
        text_transform = mult( text_transform, translation( 0, (this.graphicsState.animation_time/1000 - 5.5)*2 , 0 ));
    }
   
    
    model_transform = mult( model_transform, scale( 5, 5, 5 ) );
    text_transform = mult( text_transform, scale( 1.8, 1.8, 1.8) );
    this.m_title.draw(this.graphicsState, model_transform, textColor );
    this.m_intro.draw(this.graphicsState, text_transform, textColor);
}

Animation.prototype.display = function(time)
	{
		if(!time) time = 0;
		this.animation_delta_time = time - prev_time;
        if(animate)
            this.graphicsState.animation_time += this.animation_delta_time;
		if(animate && introPlayed == true) {
            audio.play();
        }
        if(!animate)
            audio.pause();
		prev_time = time;
		
        FPS = 1/(this.animation_delta_time/1000);
    
		update_camera( this, this.animation_delta_time );
			
		this.basis_id = 0;
		
		var model_transform = mat4();
        var intro_transform = mat4();
		
		// Materials: Declare new ones as needed in every function.
		// 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
		var purplePlastic = new Material( vec4( .9,.5,.9,1 ), .2, .5, .8, 40 ), // Omit the final (string) parameter if you want no texture
			greyPlastic = new Material( vec4( .5,.5,.5, 1 ), 1, 1, 1, 200 ),
			earth = new Material( vec4( .5,.5,.5,1 ), .5, 1, .5, 40, "earth.gif" ),
			stars = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "stars.png" );
            //aliceblue = new Material ( rgbVec(240,248,255, 200), 1, 1, 1, 40);
            //robot = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "testbb8.jpg" );
			
		/**********************************
		Start coding here!!!!
		**********************************/

        this.ground(model_transform);
        this.planet(model_transform);
        this.planet2(model_transform);
        this.obs1(model_transform, time);
        this.obs2(model_transform, time);
        this.obs3(model_transform, time);
        this.obs4(model_transform, time);
    
        //this.m_star.draw(this.graphicsState, model_transform, purplePlastic);
        
        model_transform = mult( translation( cam_x, 0, 0), model_transform );
        this.BB8(model_transform, this.animation_delta_time, this); 
        //Toggle Camera Positions
        //Camera Tracking Using Loock At
        
        if(introPlayed == false)
            this.graphicsState.camera_transform = lookAt( vec3(0, 0, 50), vec3(0,0,75), vec3(0,1,0) );
        if(intro == 1 && introPlayed == false)
            {
            intro_transform = mult( intro_transform, translation( 0, -2, 75) );
            isong.play();
            this.introduction(intro_transform, time);
                
            if(this.graphicsState.animation_time/1000 > 35.9){
                introPlayed = true;
                isong.pause();
                }
            }
        
    
        if(camPos == 1 && introPlayed == true) //Aerial View
            {
            this.graphicsState.camera_transform = lookAt( vec3(0 ,100,100), vec3(0,0,0), vec3(0,1,0) );
                aerialCam = true;
            }
        if(camPos == -1 && introPlayed == true)
            {  
                    this.graphicsState.camera_transform = lookAt( vec3(cam_x, 10, cam_z+20), vec3(cam_x,cam_y+5,cam_z), vec3(0,1,0) );
                    aerialCam = false;
            }
    
        
        if(aerialCam == false && animate && introPlayed == true)
            {

                if(B_thrust[2]==1 && bb8_pos[0] > -22.87) //Move the Camera Left when BB8 Moves
                    {
                        cam_x= cam_x - .5; //Potentially change this to follow tracking etiquette 
                        this.graphicsState.camera_transform = lookAt( vec3(cam_x, 10, cam_z+20), vec3(cam_x,cam_y+5,cam_z), vec3(0,1,0) );
                    }
                if(B_thrust[0]==1 && bb8_pos[0] < 22.87) //Move the Camera Right when BB8 Moves
                    {
                        cam_x= cam_x + .5; //Potentially change this to follow tracking etiquette 
                        this.graphicsState.camera_transform = lookAt( vec3(cam_x, 10, cam_z+20), vec3(cam_x,cam_y+5,cam_z), vec3(0,1,0) );
                    }
            }

        /*
		model_transform = mult( model_transform, translation( 0, 10, -15) );		// Position the next shape by post-multiplying another matrix onto the current matrix product
		this.m_cube.draw( this.graphicsState, model_transform, purplePlastic );			// Draw a cube, passing in the current matrices
		CURRENT_BASIS_IS_WORTH_SHOWING(this, model_transform);							// How to draw a set of axes, conditionally displayed - cycle through by pressing p and m
		
		model_transform = mult( model_transform, translation( 0, -2, 0 ) );		
		this.m_fan.draw( this.graphicsState, model_transform, greyPlastic );			// Cone
		CURRENT_BASIS_IS_WORTH_SHOWING(this, model_transform);
		
		model_transform = mult( model_transform, translation( 0, -4, 0 ) );
		this.m_cylinder.draw( this.graphicsState, model_transform, greyPlastic );		// Tube
		CURRENT_BASIS_IS_WORTH_SHOWING(this, model_transform);
		
		
		model_transform = mult( model_transform, translation( 0, -3, 0 ) );											// Example Translate
		model_transform = mult( model_transform, rotation( this.graphicsState.animation_time/20, 0, 1, 0 ) );			// Example Rotate. 1st parameter is scalar for angle, last three are axis of rotation.
		model_transform = mult( model_transform, scale( 5, 1, 5 ) );												// Example Scale
		this.m_sphere.draw( this.graphicsState, model_transform, earth );				// Sphere
		
		model_transform = mult( model_transform, translation( 0, -2, 0 ) );
		this.m_strip.draw( this.graphicsState, model_transform, stars );				// Rectangle
		CURRENT_BASIS_IS_WORTH_SHOWING(this, model_transform);*/
	}	



Animation.prototype.update_strings = function( debug_screen_strings )		// Strings this particular class contributes to the UI
{
    debug_screen_strings.string_map["time"] = "Animation Time: " + this.graphicsState.animation_time/1000 + "s";
    //debug_screen_strings.string_map["time"] = "Time: " + this.graphicsState.animation_time/1000 + "s";
    debug_screen_strings.string_map["FRAME-RATE"] = "FRAME-RATE: " + FPS;
    debug_screen_strings.string_map["MISS"] = "MISS: " + miss;
    debug_screen_strings.string_map["SCORE"] = "SCORE: " + score;
    /*debug_screen_strings.string_map["basis"] = "Showing basis: " + this.m_axis.basis_selection;
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	debug_screen_strings.string_map["thrust"] = "Thrust: " + thrust;
    debug_screen_strings.string_map["OBS1"] = "OBS1: " + obs1;
    debug_screen_strings.string_map["BB8"] = "BB8: " + bb8_pos;*/
    
}