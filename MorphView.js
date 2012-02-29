/*******************************************************************************
*FILE: MorphView.js
 * Author: Bruno Beltran
 * Purpose: Code to generate a GUI for the JavaScript version of the Morph app 
 *          Should be placed in the body of the HTML document where the app is
 *          to be viewed. Needs an external controller (as in MVC), the only 
 *          current version of which is implemented in MorphViewController.js
 *
 * (* Credits *)
 * Dr. Alain Gogniat 1997 - Original "Morph" Program - JAVA
 * Dr. Wishusen 2002 - First "Morph" applet, partial functionality - JAVA
 * Bruno Beltran 2012 - Current Version - HTML5/CSS3/JavaScript
*******************************************************************************/
//TODO Implement a UI for the "How to Play" feature

/**OBJECT CONSTRUCTOR : MorphView
 * Takes the id of the <div> into which the app should be inserted
 * Handles the drawing of children and visual tasks
 * Defines number of morphs, number of total canvases
 * Any updates to this in the HTML should be reflected here
 * Monitors all changes in the state of the app and displays them.
 */
function MorphView(insertionpoint)
{
    this.insertion = insertionpoint;
    this.selected = [false,false];
    this.generation = 0;
    this.generationData = [false];
    this.info = "Created Feb 19 2012 by Bruno Beltran for LSU's IntroBio Program";
    this.numChildren = 7;
    this.numMorphs = 9;
    this.numCanvases = 10;
    this.migrationMode = false;
    this.showDetailMode = false;
    
    // holds the points being used to draw the morph
    this.morphOriginPoints = new Array();
    this.morphEndPoints = new Array();
    // holds the dimensional data extracted from the genes
    this.dx = new Array();
    this.dy = new Array();
    // holds the morph's biggest y-offset, to be used in the final drawing stage 
    // to correctly position the Morph
    this.maxY = 0;

}

/**METHOD : MorphView.init()
 * Inserts the app into the page post-load...
 * Hopefully this will work, while ensuring it looks pretty in Lynx...
 */
MorphView.prototype.init = function()
{
    //TODO figure out how to print a VERY long string
};

/**METHOD : MorphView.draw(string, int)
 * Takes a genome and an int (number) corresponding to the canvas to draw to
 * Updates the genome and draws the morph
 */
MorphView.prototype.draw = function(genome, canvasNumber)
{
    var canvasId = "morph".concat(canvasNumber.toString());
    var textId = "genomeText".concat(canvasNumber.toString());
    // update the genome text field
    document.getElementById(textId).innerHTML=genome;
    if (genome == "")
    {
        var canvas = document.getElementById(canvasId);
        canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
    }
    // draw the morph
    this.phenotype(genome, canvasId);
    
};

/**METHOD : MorphView.phenotype(string, int)
 * Takes a genome and an int (number) representing the canvas to draw in
 * Calls transcript(string) to create the necessary data for drawing
 * Draws the morph to scale of the corresponding canvas
 */
MorphView.prototype.phenotype = function(genomeString, canvasId)
{
    // turn the genome into point data we can try to use for drawing
    this.transcript(genomeString);
    // get the canvas
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");  
    // we'll use this to position the morph
    var canvasCenter = [canvas.width,canvas.height];
    // if we're drawing in the show detail box, make every length bigger
    if (canvasId == "morph10")
    {
		for (var i = 0; i < this.morphOriginPoints.length; i++)
		{
			this.morphOriginPoints[i][0] *= 2;
			this.morphOriginPoints[i][1] *= 2;
			this.morphEndPoints[i][0] *= 2;
			this.morphEndPoints[i][1] *= 2;
		}
		this.maxY *= 2;
    }
    // now clear the canvas for drawing
    document.getElementById(canvasId).getContext("2d").clearRect(0,0,canvas.width,canvas.height);
    // finally, draw the morph
    context.beginPath();
    for (var i = 0; i < this.morphOriginPoints.length; i++)
    {
      context.moveTo(
            canvasCenter[0]/2 + this.morphOriginPoints[i][0],
            .95*canvasCenter[1] - this.maxY + this.morphOriginPoints[i][1]);
      context.lineTo(
            canvasCenter[0]/2 + this.morphEndPoints[i][0],
            .95*canvasCenter[1] - this.maxY + this.morphEndPoints[i][1]);
      context.moveTo(
            canvasCenter[0]/2 - this.morphOriginPoints[i][0],
            .95*canvasCenter[1] - this.maxY + this.morphOriginPoints[i][1]);
      context.lineTo(
            canvasCenter[0]/2 - this.morphEndPoints[i][0],
            .95*canvasCenter[1] - this.maxY + this.morphEndPoints[i][1]);
    }
    context.strokeStyle="black";
    context.stroke();
};

/**HELPER METHOD : MorphView.transcript(string)
 * Called by MorphView.phenotype(string,int)
 * Takes a genome.
 * Updates MorphView's state data to hold a drawable translation of the genome.
 */
MorphView.prototype.transcript = function(genomeString)
{
    // clear old drawing data
    this.morphOriginPoints.length = 0;
    this.morphOriginPoints.length = new Array();    
    this.morphEndPoints.length = 0;
    this.morphEndPoints.length = new Array();    
    this.maxY = 0;
    this.dx.length = 0;
    this.dy.length = 0;
	// make the strings into an array of numbers in the range (-7,7)
	// handles invalid letters with modulo
	var geneIntArray = new Array(genomeString.length);
	for (var i = 0; i < genomeString.length; i++)
	{
		geneIntArray[i]=(genomeString.charCodeAt(i)-71)
	}
    // translates the genome into usable distance information
    // IDK what to name this 8.....
    this.dx = new Array(8);
    this.dy = new Array(8);
    this.dx[0] = -(geneIntArray[1]) / 4;
	this.dx[1] = -(geneIntArray[0]) / 4;
	this.dx[2] = geneIntArray[3] / 2;
	this.dx[3] = geneIntArray[0] / 2;
	this.dx[4] = geneIntArray[1] / 2;
	this.dx[5] = geneIntArray[2] / 2;
	this.dx[6] = -this.dx[2] / 2;
	this.dx[7] = -this.dx[5] / 2;
	
	this.dy[0] = geneIntArray[5] / 2;
	this.dy[1] = geneIntArray[4];
	this.dy[2] = geneIntArray[3];
	this.dy[3] = -geneIntArray[4];
	this.dy[4] = -geneIntArray[5];
	this.dy[5] = geneIntArray[6];
	this.dy[6] = geneIntArray[0];
	this.dy[7] = -this.dy[5];
	
	var treeHeight = geneIntArray[8];
	
	// will recursively generate points to a stack height of treeHeight
	this.tree(0,0,treeHeight,0);
	return 0;
};


/**RECURSIVE HELPER METHOD : MorphView.tree(int,int,int,int)
 * Takes(initial X-offset, initial Y-offset, recursive count, initial direction)
 * Helps MorphView.transcript(string) create the data for drawing
 * Builds half of the morph, with each call branching out a new line to draw
 */
MorphView.prototype.tree = function(oldX, oldY, order, direction)
{
    var newX;
    var newY;
    // the "8" is the same one from transcript(.), still don't know what to 
    // name it
    if (direction < 0)
    {
        direction += 8;
    }
    else if (direction >= 8)
    {
        direction -= 8;
    }
    // generates two new coordinates
    newX = oldX + order*this.dx[direction];
    newY = oldY + order*this.dy[direction];
    if (newY > 100)
    {
        newY = 100;
    }
    // push this "gene" onto the list of lines to be drawn
    if (oldY > this.maxY)
    {
        this.maxY = oldY;
    }
    else if (newY > this.maxY)
    {
        this.maxY = newY;
    }
    this.morphOriginPoints.push([oldX,oldY]);
    this.morphEndPoints.push([newX,newY]);
    // recusively call tree until order is zero
    if (order > 0)
    {
        this.tree(newX, newY, order - 1, direction - 1);
        this.tree(newX, newY, order - 1, direction + 1);
    }
};

/**METHOD : MorphView.newGeneration()
 * Updates the generation numbers, moves selected children to the "parents" slot
 */
MorphView.prototype.newGeneration = function()
{
    // get the biggest current generation
    var generationNumbers = 
      document.getElementById("generationSelector").innerHTML.match(/[0-9]+/gi);
    if (generationNumbers != null)
    {
		// the last number should always be the biggest right?
		var biggestGeneration = generationNumbers[generationNumbers.length - 1];
    }
    else 
    {
        // force creation of generation 0
        var biggestGeneration = "-1";
    }
    // set generation counter to the next higher number
    this.generation = parseInt(biggestGeneration,10) + 1;
    
    // make new generation number
    document.getElementById("generationSelector").innerHTML +=
    
        '<li id="gen'.concat(this.generation.toString()).concat(
         '" class="generationNumber" onclick="selectGeneration(this)">').concat(
         this.generation.toString()).concat(
         '</li> <li class="generationNumberSeperator">-</li>');
    // un-highlight the old generation
    $(".generationNumber").css("font-weight","normal");
    // highlight the current generation
    document.getElementById("gen".concat(this.generation)).style.fontWeight = "bold";    
};    

/**METHOD : MorphView.save()
 * Write out the state of the app into the save box and MorphView.generationData
 * Format: ["GENOME", "GENOME", ..., blank_spot,... ]["GENOME", ...]..."
 * Where the individual "arrays" contain MorphView.numCanvases elements
 */
MorphView.prototype.save = function()
{
    // so that we can switch back whenever
	this.generationData.push("");
	// remember, this.generationData[0]=false, so start counting at one
	this.generationData[this.generation] = new Array(this.numCanvases);
    // loop through the genomes, adding them to the save box 
    document.getElementById("saveBox").innerHTML += "["
    for (var i = 1; i <= this.numCanvases; i++)
    {
        // this GROSSS pair of lines outputs the genomes seperated by commas
        document.getElementById("saveBox").innerHTML += "\"".concat(document.getElementById("genomeText".concat(i.toString())).innerHTML).concat("\"");
       if(i<this.numCanvases)document.getElementById("saveBox").innerHTML+=", ";
        // this GROSSS line puts it in this.generationData
        this.generationData[this.generation][i-1] = document.getElementById("genomeText".concat(i.toString())).innerHTML;
    }
    // gets the "detail" canvas
    document.getElementById("saveBox").innerHTML += "];"
};

/**METHOD : MorphView.getGenome(int)
 * Takes a int (number) and gets the corresponding genome
 */
MorphView.prototype.getGenome = function(index)
{
    var id = "genomeText".concat(index.toString());
    return document.getElementById(id).innerHTML;
};

/**METHOD : MorphView.highlight()
 * Takes a list of morph canvases and marks the correct ones as selected
 * MorphView keeps track of which morphs are selected
 */
MorphView.prototype.highlight = function(list)
{
    $(".morphCanvas").css("outline","none");
    if (list[0] != false)
    {
        list[0].style.outline="3px outset red";
    }
    if (list[1] != false)
    {
        list[1].style.outline="3px outset red";
    }
};

MorphView.prototype.showError = function(errstring)
{
    $("#errBox").html(errstring);
    $("#errBox").css("z-index","3");
    $("#errBox").animate({opacity:1}, 1500, function(){
        $("#errBox").animate({opacity:0,"z-index":-3}, 2000);
    });
}

