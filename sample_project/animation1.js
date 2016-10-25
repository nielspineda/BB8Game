// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), B_thrust = vec3(),	looking = false, prev_time = 0, animate = false, animation_time = 0, camPos = -1, aerialCam = false;
		var gouraud = false, color_normals = false, solid = false;
            var bb8_transform = mat4(), bb8_x = 0, bb8_y = 0, bb8_z=0, bb_stack = [],  key0up = true,  key1up = true, key2up= true, cam_x = 0, cam_y=0, cam_z= 0; 
                var obs1 = [0, 0, -100], bb8_pos = [0, 0, 0], testvec= mat4(); //[1, 1, 1, 1];
                    var miss = 0;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); }


// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "stars.png", "text.png", "earth.gif", "BB8Text.png", "BB8TextHead.png", "sand1.png" ];

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
		
		gl.clearColor( .482, .707, .98, 1 );			// Background color
		
		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );
		
		self.m_cube = new cube();
		//self.m_obj = new shape_from_file( "bb8.obj" );
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 4 );	
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );
        
        self.m_head = new shape_from_file( "BB8HEAD.obj" );
        self.m_windmill = new windmill(3); 
        self.m_upperLeg = new upper_leg(20, mat4() ); 
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
	shortcut.add( "ALT+a", function() { animate = !animate; } );
	
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
}

function update_camera( self, animation_delta_time )
	{
        //CamPos decides aerial view or BB8 focused View
		/*if(camPos[0] == 1) //camPos[0] = 1 means pageup was pressed, so want aerial view
        {
        camera_transform = LookAt(); 
        }
        
        //Note, may need to utilize switch. Let's see how this works first
        if(campPos[0] == 1)
        {
                
        }*/
        
        
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

/*function update_bb8(model_transform)
    {
        model_transform = mult( translation( scale_vec( meters_per_frame, B_thrust ) ), model_transform);
    }*/

var rgbVec = function(R, G, B, alpha)
{
  return vec4( R/255.0, G/255.0, B/255.0, alpha/255.0);  
}

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


Animation.prototype.ground = function(model_transform)
{
    var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
    var sand = new Material( vec4( .5,.5,.5, 10 ), .55, .5, .5, 40, "sand1.png" )
    
    var ground_transform = model_transform; 
    ground_transform = mult( ground_transform, scale( 50, .1, 500) );
    ground_transform = mult( ground_transform, translation( 0, -20, 0) );
    this.m_cube.draw( this.graphicsState, ground_transform, sand );
    
    //glMatrixMode(sand);
    return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

//Two Level Hierarchical Object: Head & Body of BB8

Animation.prototype.BB8 = function ( model_transform, animation_delta_time, cam)
{
    //This function will split making the leg into two parts; the upper leg and bottom leg
    
    var aliceblue = new Material ( rgbVec(240,248,255, 200), 1, 1, 1, 40);
    var BB8_bod = new Material( vec4( .5,.5,.5, 10 ), .55, .5, .5, 40, "BB8Text.png" )
    var BB8_head = new Material( vec4( .5,.5,.5, 10 ), .55, .5, .5, 40, "BB8TextHead.png" )
    
    var stack = [];     
    var originalModel = model_transform;
    var body_transform = model_transform;
    stack.push(originalModel);
    
    //model_transform = mult( translation( 0, bb8_y, bb8_z ), model_transform );
    //model_transform = mat4();
    body_transform = mult( model_transform, rotation( this.graphicsState.animation_time/2, -200, 0, 0 ) );
    
    
    //Movement
    if(animate)
    {    
        
        if(B_thrust[2] == 1 && B_thrust[0] == 1)
        {
           // bb8_x = 0;
            model_transform = model_transform = mult( translation( cam_x, bb8_y, bb8_z ), model_transform );
            body_transform = model_transform;
        }
        if(B_thrust[2] == 1) //Move Left
        {
            bb_stack.push(model_transform)
            //var mpf  = .0001 * animation_delta_time;
            //bb8_x = bb8_x-.005;
            bb8_pos[0] = bb8_pos[0] - .005; 
            model_transform = mult( translation( cam_x, bb8_y, bb8_z ), model_transform );
            body_transform = mult( model_transform, rotation( this.graphicsState.animation_time, 0, 0, 1 ) ); 
            //cam.graphicsState.camera_transform = lookAt( vec3(bb8_x, 5, bb8_z+15), vec3(bb8_x,bb8_y,bb8_z), vec3(0,1,0) );
            key2up = false;
        }

        if(B_thrust[2] == 0 && key2up == false)
        {
            key2up = true;  
            //bb8_x = 0;
            //model_transform = model_transform = mult( translation( bb8_x, bb8_y, bb8_z ), model_transform );
            model_transform = model_transform = mult( translation( cam_x, bb8_y, bb8_z ), model_transform );
            body_transform = model_transform;
        }
        
        //Figure out how to keep in bounds
        /*if(bb8_x < -.2)
        {
            bb8_x = bb8_x + .25;
            model_transform = model_transform = mult( translation( bb8_x, bb8_y, bb8_z ), model_transform );
            body_transform = mult( model_transform, rotation( this.graphicsState.animation_time, 0, 0, 200 ) );
        }*/

        /*if(B_thrust[1] == 1) // Move Forward
        {
            bb8_z = bb8_z-.005;
            model_transform = mult( translation( bb8_x, bb8_y, bb8_z ), model_transform );
            body_transform = mult( model_transform, rotation( this.graphicsState.animation_time/2, -200, 0, 0 ) );
            key1up = false;
            //cam.graphicsState.camera_transform = lookAt( vec3(bb8_x, 5, bb8_z+15), vec3(bb8_x,bb8_y,bb8_z), vec3(0,1,0) );
            //model_transform = mult( translation( scale_vec( meters_per_frame, 1 ) ), model_transform);
        }

        if(B_thrust[1] == -1) // Move Backward
        {
            bb8_z = bb8_z+.005;
            model_transform = mult( translation( bb8_x, bb8_y, bb8_z ), model_transform );
            body_transform = mult( model_transform, rotation( this.graphicsState.animation_time/2, 200, 0, 0 ) );
            key1up = false;
            //model_transform = mult( translation( scale_vec( meters_per_frame, 1 ) ), model_transform);
        }

        if(B_thrust[1] == 0 && key1up == false)
        {
            key1up = true;  
            bb8_z = bb8_z * 0;
            model_transform = model_transform = mult( translation( bb8_x, bb8_y, bb8_z ), model_transform );
            body_transform = model_transform;
        }*/


        if(B_thrust[0] == 1) //Move Right
        {
            //bb8_x = bb8_x+.005;
            bb8_pos[0] = bb8_pos[0]  + .005; 
            model_transform = mult( translation( cam_x, bb8_y, bb8_z ), model_transform );
            body_transform = mult( model_transform, rotation( this.graphicsState.animation_time, 0, 0, -1 ) );
            key0up = false;
            //model_transform = mult( translation( scale_vec( meters_per_frame, 1 ) ), model_transform);
        }

        if(B_thrust[0] == 0 && key0up == false)
        {
            key0up = true;  
           // bb8_x = 0;
            model_transform = model_transform = mult( translation( cam_x, bb8_y, bb8_z ), model_transform );
            //model_transform = model_transform = mult( translation( 0, bb8_y, bb8_z ), model_transform );
            body_transform = model_transform;
        }
        
    }
    var head_transform = mult(model_transform, translation(.6, 1.5, 0));
    this.m_head.draw( this.graphicsState, head_transform, BB8_head );
    
    //model_transform = body_transform; 
    body_transform = mult( body_transform, scale(2, 2, 2));
    this.m_sphere.draw( this.graphicsState, body_transform, BB8_bod );	
        
    return originalModel;//model_transform;
    //return oModelTransform2; 
    //return oModelTransform1;
    
}

Animation.prototype.obs1 = function ( model_transform, time)
{
        var oModelTransform = model_transform; //Original Model to return later, so no need to do inverse/push or pop
        var deathbox = new Material ( rgbVec(255,0,40, 100), 1, 1, 1, 40);

        var ground_transform = model_transform; 
        ground_transform = mult( ground_transform, scale( 5, 5, 5) );
        //this.m_sphere.draw( this.graphicsState, ground_transform, deathbox );
        
        if(animate){
        if(obs1[2] < 5) //It's going to move at you
            {
            obs1[2] = obs1[2] + .4; 
            ground_transform = mult( ground_transform, translation( obs1[0], obs1[1], obs1[2]) );
            }
        if( Math.abs(obs1[2] - bb8_z) < .001 && Math.abs(obs1[1]-bb8_y) < .001 && Math.abs(obs1[0]-bb8_pos[0]) < 1)
           {
            obs1[2] = -20;
            ground_transform = mult( ground_transform, translation( obs1[0], obs1[1], obs1[2]) );
            }
        if(obs1[2] > 5)
            {
            obs1[2] = -100;
            miss +=1; //Increment the number of misses
            ground_transform = mult( ground_transform, translation( obs1[0], obs1[1], obs1[2]) );
            }
        
        this.m_cube.draw( this.graphicsState, ground_transform, deathbox );
        }
        return oModelTransform; //This essentially acts as the push/pop so you don't have to worry about messing w/ inverse 
}

Animation.prototype.display = function(time)
	{
		if(!time) time = 0;
		this.animation_delta_time = time - prev_time;
		if(animate) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;
		
		update_camera( this, this.animation_delta_time );
			
		this.basis_id = 0;
		
		var model_transform = mat4();
		
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
		
		//model_transform = mult( model_transform, scale( 5, 1, 5 ) );	
        //var windmill_1 = mult( model_transform, rotation( this.graphicsState.animation_time/20, 0, 1, 0 ) );
        //this.m_windmill.draw(this.graphicsState, windmill_1, earth);
        
      
        
    
    
        //var stack = [];     
        //var originalModel = model_transform;
        //stack.push(originalModel);
        
        this.ground(model_transform);
        this.obs1(model_transform, time);
    
        //bb8_transform = mult( translation( cam_x, bb8_y, bb8_z ), bb8_transform );
        bb8_transform = mat4();
        this.BB8(bb8_transform, this.animation_delta_time, this); 
        testvec = bb8_transform * testvec; 
        //this.BB8(model_transform).position.x += 2; 
        
          //Toggle Camera Positions
    //Camera Tracking Using Loock At
        if(camPos == 1) //Aerial View
            {
            this.graphicsState.camera_transform = lookAt( vec3(0 ,100,100), vec3(0,0,0), vec3(0,1,0) );
                aerialCam = true;
            }
        if(camPos == -1)
            {  
                    this.graphicsState.camera_transform = lookAt( vec3(cam_x, 10, cam_z+20), vec3(cam_x,cam_y+5,cam_z), vec3(0,1,0) );
                    aerialCam = false;
                
            }
        
        if(aerialCam == false && animate)
            {
                /*if(B_thrust[1]==1)
                    {
                        cam_z= cam_z - .1; //Potentially change this to follow tracking etiquette 
                        this.graphicsState.camera_transform = lookAt( vec3(cam_x, 5, cam_z+15), vec3(cam_x,cam_y,cam_z), vec3(0,1,0) );
                        //this.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), this.graphicsState.camera_transform );
                    }
                if(B_thrust[1]==-1)
                    {
                        cam_z= cam_z + .1; //Potentially change this to follow tracking etiquette 
                        this.graphicsState.camera_transform = lookAt( vec3(cam_x, 5, cam_z+15), vec3(cam_x,cam_y,cam_z), vec3(0,1,0) );
                        //this.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), this.graphicsState.camera_transform );
                    }*/
                if(B_thrust[2]==1)
                    {
                        cam_x= cam_x - .09; //Potentially change this to follow tracking etiquette 
                        this.graphicsState.camera_transform = lookAt( vec3(cam_x, 10, cam_z+20), vec3(cam_x,cam_y+5,cam_z), vec3(0,1,0) );
                        //this.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), this.graphicsState.camera_transform );
                    }
                if(B_thrust[0]==1)
                    {
                        cam_x= cam_x + .09; //Potentially change this to follow tracking etiquette 
                        this.graphicsState.camera_transform = lookAt( vec3(cam_x, 10, cam_z+20), vec3(cam_x,cam_y+5,cam_z), vec3(0,1,0) );
                        //this.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), this.graphicsState.camera_transform );
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
	debug_screen_strings.string_map["basis"] = "Showing basis: " + this.m_axis.basis_selection;
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	debug_screen_strings.string_map["thrust"] = "Thrust: " + thrust;
    debug_screen_strings.string_map["OBS1"] = "OBS1: " + obs1;
    debug_screen_strings.string_map["BB8"] = "BB8: " + bb8_pos;
    debug_screen_strings.string_map["TVec"] = "TVec: " + testvec;
    /*debug_screen_strings.string_map["BB8X"] = "BB8X: " + bb8_x;
    debug_screen_strings.string_map["BB8Y"] = "BB8Y: " + bb8_y;
    debug_screen_strings.string_map["BB8Z"] = "BB8Z: " + bb8_z;*/
}