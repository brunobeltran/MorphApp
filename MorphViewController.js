/*******************************************************************************
*FILE: MorphViewController.js
 * Author: Bruno Beltran
 * Purpose: Controls GUI generation for the JavaScript version of the Morph app 
 *          Should be placed in the head of the HTML document where the app is
 *          to be viewed. Needs a GUI to implement the drawing functionality 
 *          and a Model (as in MVC) to implement the app's functionality.
 *          NEEDS jQuery
 * (* Credits *)
 * Dr. Alain Gogniat 1997 - Original "Morph" Program - JAVA
 * Dr. Wishusen 2002 - First "Morph" applet, partial functionality - JAVA
 * Bruno Beltran 2012 - Current Version - HTML5/CSS3/JavaScript
*******************************************************************************/
/* ************ *** ************* ***** ** 
                 HOW TO USE              **
 ****** ***** **** **** ********** ***** ***
  1. include a jQuery.js file in your <head> element
  2. include MorphViewController.js, MorphView.js, and MorphModel.js
  3. change the value on line 40 from "appContainer" to the id of the <div>
     element where you want the Morph App to live
  4. Finally, copy the relevant HTML and CSS into your webpage
     
     Possible issues: since the internals of the app rely heavily on knowing
     the DOM element id's of the app's generated tags, if you happen (unlikely)
     to use one of these id's yourself, either the app or your site will break.
     //TODO obfuscate id's to prevent this.
     */
    
    
    
    /* NOTE: program lacks strict adherence to MVC paradigm, mostly due to 
             issues created by the implementation of MorphViewController in
             the global namespace */
 



/**GLOBAL FUNCTION INIT()
 * This is the function that should be called when initializing the app
 * It creates three objects, a MorphView, MorphModel, and MorphViewController
 * NOTE:Constants are defined here and should only be modified from here.
 */
window.onload = function initializeMorphApplication()
{
    /**CONSTANT DEFINITIONS**/
    //TODO
    // global appView contains GUI
    appView = new MorphView("appContainer");
    // global morphModel contains gene processing functions
    morphModel = new MorphModel();
    appView.init();
    morphViewController = new MorphViewController();
    // draw generation 0
    for (var i = 1; i <= appView.numChildren; i++)
    {
        appView.draw(morphModel.randomGenome(),i);
    }
    selectGeneration(document.getElementById("gen0"));
    appView.save();
}

/**OBJECT CONSTRUCTOR : MorphViewController
 * Provides an interface between the implementation of MorphView and the 
   underlying model.
 * Keeps several details about the view necessary for functioning.
 * NOTE:Any rewrites of the View should implement all the methods references by 
        the ViewController, or else edit this file. 
 * Officially monitors no state, but is aware of the implementation details of
   the View and Model through queries at initialization. These queries should 
   also be implemented by any extensions.
 */
function MorphViewController()
{
 //UNUSED - MorphViewController is currently implemented in the global namespace
}

/* FROM VIEW for option parsing TO MODEL for processing */
function reproduce()
{
    if (appView.selected[0] == false)
    {
        // there's nothing to do
        return;
    }
    // tell the view there's a new generation coming
    appView.newGeneration();
    // move the selected children to the parent boxes
    appView.draw(document.getElementById("genomeText".concat(    
                          appView.selected[0].id.match(/[0-9]+/))).innerHTML,8);
    // if there's only one morph selected, do a clone
    if (appView.selected[1] == false)
    {
        appView.draw(document.getElementById("genomeText8").innerHTML, 9);
    }
    else
    {
        appView.draw(document.getElementById("genomeText".concat(
                          appView.selected[1].id.match(/[0-9]+/))).innerHTML,9);
    }
    // cross the parents
    var crossedGenomes = 
                morphModel.cross(
                                 appView.getGenome(appView.numChildren+1),
                                  appView.getGenome(appView.numChildren+2));
    // now generate 7 children
    for (var i = 0; i < appView.numChildren; i++)
    {
        var newGenome;
        // randomly choose one of the genomes returned by morphModel.crossOver
        if (Math.round(Math.random()) == 1)
        {
            newGenome = morphModel.mutate(crossedGenomes[0]);
        }
        else
        {
            newGenome = morphModel.mutate(crossedGenomes[1]);
        }
        appView.draw(newGenome, i+1);
    }
    // save the initial generation state so that we can undo
    appView.save();
    appView.selected[0] = false;
    appView.selected[1] = false;
    appView.highlight(appView.selected);
}

/* FROM VIEW to MODEL to VIEW */
function selectMorph(child)
{
    /* set the "selected" morphs to the correct values */
		// if we're in Show Detail mode or Migration Mode, only allow one
		if (appView.showDetailMode)
		{
			appView.selected[0] = child;
			appView.selected[1] = false;
			// sends the genome of the child to draw with the index 10, for 
			// the big detail tab
			appView.draw(appView.getGenome(child.id.match(/[0-9]+/)),10);
	        document.getElementById("detailLabel").innerHTML=child.id.match(
	                                                                  /[0-9]+/);
		}
		else if (appView.migrationMode)
		{
			// replace the morph with a random morph, don't highlight
		    appView.draw(morphModel.randomGenome(),child.id.match(/[0-9]+/));
		}
        // if nothing's been clicked yet, just select it
        else if (appView.selected[0] == false)
        {
            appView.selected[0] = child;
        }
		// if what's been click has already been selected, unselect
		else if (appView.selected[0] == child)
		{
			appView.selected[0] = appView.selected[1];
			appView.selected[1] = false;
			appView.highlight(appView.selected);
			return;
		}
		else if (appView.selected[1] == child)
		{
			appView.selected[1] = false;
			appView.highlight(appView.selected);
			return;
		}
		// otherwise select the morph and update what to highlight
		else 
		{
			// if selected[1] isn't ==false aka empty, transfer it to [0]
			if (appView.selected[1] != false)
			{
				appView.selected[0] = appView.selected[1];
			}
			appView.selected[1] = child;
		}
    // highlight the morphs now in "selected"
    appView.highlight(appView.selected);
}

/* FROM VIEW to MODEL to VIEW */
/* Optional second parameter allows the caller to force generation reset */
function selectGeneration(genElem, force)
{
    // make sure that's not the already the correct generation
    if (genElem.style.fontWeight == "bold" && force != -1)
    {
        // then there's nothing to do
        return;
    }    
    // draw correct morphs & update state/genomes
    var newGenValue = genElem.innerHTML.match(/[0-9]+/)[0];
    for (var i = 0; i < appView.generationData[newGenValue].length; i++)
    {
        appView.draw(appView.generationData[newGenValue][i],i+1);
    }
    appView.generation = newGenValue;
    // un-highlight the old generation
    $(".generationNumber").css("font-weight","normal");
    // highlight the current generation
    genElem.style.fontWeight="bold"
    
}

// I guess this should technically be in the view, sending a message to the
// model, but I'm done with this MVC BS.
/* FROM VIEW to MODEL */
function setMutationRate(string)
{
    $("button").css("outline", "none");
    if (string == "low")
    {
        morphModel.MUTATION_RATE = 1;
        $("#mutationRateLow").css("outline","3px outset white");
    }
    else if (string == "med")
    {
        morphModel.MUTATION_RATE = 2;
        $("#mutationRateMed").css("outline","3px outset white");
    }
    else if (string == "high")
    {
        morphModel.MUTATION_RATE = 3;
        $("#mutationRateHigh").css("outline","3px outset white");
    }
    else if (string == "off")
    {
        morphModel.MUTATION_RATE = 0;
        $("#mutationRateOff").css("outline","3px outset white");
    }
}

// Attempts to parse the pasted input into a form that newGenData can use,
// then draw the correct generation numbers and the last generation
function loadSession()
{
    // get the data section of the save dialog
    var newGenData = document.loadForm.loadBox.value;
    // this regex should extract every instance of an array of genome strings
    var genExtractor = /\[(?:"([A-N])*"(,\s)*)*\]/g;

    var newGenerations = newGenData.match(genExtractor);
    if (newGenerations == null)
    {
        document.loadForm.loadBox.value = "Faulty data...";
        return;
    }
    // because of how we saved the generation data....magic happens
    appView.generationData.length = 0;
    appView.generationData = eval(newGenerations);
    // draw generation numbers
    document.getElementById("generationSelector").innerHTML = "";
    for (var i = 0; i < appView.generationData.length; i++)
    {
        appView.generationData[i] = eval(appView.generationData[i]);
        appView.newGeneration();
    }
    selectGeneration(
     document.getElementById("gen".concat(appView.generationData.length-1)), 
                                                                            -1);
}

// if there have been changes to the current generation, revert, else
// do nothing
function undo()
{
    // first check if the current state is equal to the last saved generation
    var different = false;
    for (var i = 0; i < appView.numMorphs; i++)
    {
        if (appView.generationData[appView.generation][i] != 
       document.getElementById("genomeText".concat((i+1).toString())).innerHTML)
        {
            different = true;
        }
    }
    if (different)
    {
        // redraw that generation
        selectGeneration(
      document.getElementById("gen".concat(appView.generation.toString())), -1);
    }
    else 
    {
        alert("Nothing to UNDO!!");
    }
}

/* jQuery-reliant funtions */
/* 4 the pretty animations */
$(document).ready(function(){
    // button animation
    $("button").mousedown(function(event){
        $(event.target).addClass("buttonPressed");
    });
    $("button").mouseup(function(event){
        $(event.target).removeClass("buttonPressed");
    });
    $("button").mouseout(function(event){
        if ($(event.target)==$("#loadButton"))
        {
            $("#loadButtonPressed").css("opacity",0);
        }
        $(event.target).removeClass("buttonPressed");
    });
	// toggles the visibility of the genome text boxes
	$("#toggleGenomeViewButton").click(function(){
		if ($(".genomeText").css("opacity") != 0)
		{
			$(".genomeText").animate({opacity:0},"slow");
		}
		else
		{
			$(".genomeText").animate({opacity:1},"slow");
		}
	});
	$("#toggleDetailGenomeButton").click(function(){
		if ($("#genomeText10").css("opacity") != 0)
		{
			$("#genomeText10").animate({opacity:0},"slow");
		}
		else 
		{
			$("#genomeText10").animate({opacity:1},"slow");
		}
	});
	// toggles the "Mutation Rate" window
	$("#mutationRateTab").click(function(){
		if ($("#mutationRateTab").css("left")=="-170px")
		{
			$("#mutationRateTab").animate({left:"0px"},"slow");
			$("#mutationRateWindow").animate({"z-index":-1,opacity:0},"slow");
		}
		else
		{
			$("#mutationRateTab").animate({left:"-170px"},"slow");
			$("#mutationRateWindow").css("z-index",1);
			$("#mutationRateWindow").animate({"opacity":1},"slow");
		}
	});
	// toggles the "Migration" window
	$("#migrationTab").click(function(){
		if ($("#migrationTab").css("left")=="-170px")
		{
            appView.migrationMode = false;
			$("#migrationTab").animate({left:"0px"},"slow");
			$("#migrationWindow").animate({"z-index":-1,opacity:0},"slow");
		}
		else
		{
		    appView.migrationMode = true;
			$("#migrationTab").animate({left:"-170px"},"slow");
			$("#migrationWindow").css("z-index",1);
			$("#migrationWindow").animate({"opacity":1},"slow");
		}
	});
	// toggles the "Show Options" window
	$("#showDetailTab").click(function(){
		if ($("#showDetailTab").css("left")=="-220px")
		{
		    appView.showDetailMode = false;
			$("#showDetailTab").animate({left:"0px"},"slow");
			$("#showDetailWindow").animate({"z-index":-1,opacity:0},"slow");
		}
		else
		{
		    appView.showDetailMode = true;
			$("#showDetailTab").animate({left:"-220px"},"slow");
			$("#showDetailWindow").css("z-index",1);
			$("#showDetailWindow").animate({"opacity":1},"slow");
		}
	});
	// submits the genome changes in the "show detail" box
	$("#submitGenomeButton").click(function(){
	    var newGenome = 
	                document.genomeForm.genomeText10.value.match(/[A-M]*[J-N]/);
	    if (newGenome == null)
	    {
	        return;
	    }
	    appView.draw(
	             newGenome[0],document.getElementById("detailLabel").innerHTML);
	    appView.draw(newGenome[0],appView.numChildren+3);
	});
});