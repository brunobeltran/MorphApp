/*******************************************************************************
*FILE: MorphModel.js
 * Author: Bruno Beltran
 * Purpose: Code to drive the JavaScript version of the morph app, when the 
 *          View (as in MVC) is created externally (as in MorphViewGenerator.js)
 *
 * (* Credits *)
 * Dr. Alain Gogniat 1997 - Original "Morph" Program - JAVA
 * Dr. Wishusen 2002 - First "Morph" applet, partial functionality - JAVA
 * Bruno Beltran 2012 - Current Version - HTML5/CSS3/JavaScript
*******************************************************************************/
/* ** *** **** *** ** * ** *** *
 * Genome code works as follows: 
            A genome of length "n" has "n-1" chars between 'A' and 'M'
            and one char (at genome[n-1]) between 'I' and 'N'
            
            When a new child is to be made, "crossing over" is simulated
            by randomly switching or keeping Math.floor(n/3) "genes" on the ends
            of the two parent genomes. One of the products of this "cross over"  
            is chosen at random, and "mutation" is simulated by adding a small
            random integer to the unicode value of one "gene" (with modulo).
            
            Then to draw the morph, we convert the genome to ints in the range
            (-maxGeneAllowed, maxGeneAllowed) using the Unicode values.
            The lines are created by "transcripting" the ints into values which
            we can use as dimension data.
*/

/* **** *** **** **
 * COMPATIBILITY
 *** ****** *** ** */
if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();
    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }
    return res;
  };
}



/**OBJECT CONSTRUCTOR : MorphModel 
 * Handles processing of the genome
 * Keeps the length of gene allowed and range of genes allowed
 * Moniters the mutation rate constant
 */

function MorphModel()
{
    //NOTE: Constants are defined in MorphViewController.js to ease modification
    // LOW=1 MED=2 HIGH=3, default==3
    this.MUTATION_RATE = 3;
    this.MAX_GENE_ALLOWED = 7;// used as modulo, max gene is actually 6="M"
    this.GENE_LENGTH = 9;
}

/**METHOD : MorphModel.randomGenome()
 * Returns a random genome
 */
MorphModel.prototype.randomGenome = function()
{
    var genomeCharArray = new Array(this.GENE_LENGTH);
	// random number between -maxGeneAllowed and maxGeneAllowed - 1
	for (var i = 0; i < this.GENE_LENGTH; i++)
	{
		// += random number between 0 and maxMutation
		genomeCharArray[i] = Math.floor(Math.random()*(this.MAX_GENE_ALLOWED+1));
		if (Math.round(Math.random()) == 1)
		{
		    genomeCharArray[i] *= (-1);
		}
		genomeCharArray[i] %= this.MAX_GENE_ALLOWED;
	}
	genomeCharArray[this.GENE_LENGTH-1] += 1;
    // put the last gene in the correct range
	if (genomeCharArray[this.GENE_LENGTH-1] < 0)
	{
	   genomeCharArray[this.GENE_LENGTH-1]=-genomeCharArray[this.GENE_LENGTH-1];
	}
	if (genomeCharArray[this.GENE_LENGTH-1] < 3)
	{
	    genomeCharArray[this.GENE_LENGTH-1] = 7;
	}
	// put back in Unicode
	for (var i = 0; i < this.GENE_LENGTH; i++)
	{
	    genomeCharArray[i] += 71;
	}
	// magically returns a string holding the new genome
	return genomeCharArray.map(function(value){return String.fromCharCode(value);}).join().replace(/,/gi, "");
};

/**METHOD : MorphModel.cross(string, string)
 * Takes two genomes of equal length
 * Performs "crossing over"
 * Returns the result
 */
MorphModel.prototype.cross = function(genomeString1, genomeString2)
{
    var genomeLength = genomeString1.length;
    var crossOverLength = Math.ceil(genomeLength/3);
    var genomeCharArray1 = new Array(genomeLength);
    var genomeCharArray2 = new Array(genomeLength);
    // does the crossing over three times, because the original app did it
    for (var j = 0; j < 3; j++)
    {
		// switches (or not) the ends
		for (var i = 0; i < genomeLength; i++)
		{
			// if these are the genes we're looking for
			if (i < crossOverLength || i > (genomeLength-crossOverLength-1))
			{        
				// random binary if
				if (Math.round(Math.random()) == 1)
				{
					genomeCharArray1[i] = genomeString2.charAt(i);
					genomeCharArray2[i] = genomeString1.charAt(i);
				}
				else
				{
					genomeCharArray1[i] = genomeString1.charAt(i);
					genomeCharArray2[i] = genomeString2.charAt(i); 
				}
			}
			// else don't try to cross over
			else
			{
				genomeCharArray1[i] = genomeString1.charAt(i);
				genomeCharArray2[i] = genomeString2.charAt(i);
			}
		}
	}
    return [genomeCharArray1.join().replace(/,/gi,""), 
            genomeCharArray2.join().replace(/,/gi,"")];
};

/**METHOD : MorphModel.mutate(string)
 * Takes one "crossed-over" genome
 * "Mutates" one gene.
 * Returns the result (ready to draw)
 */
MorphModel.prototype.mutate = function(genomeString)
{
    // mutate, or skip if (!(maxMutation > 0)), which should correspond
    // to mutation rate being set to zero
    if (this.MUTATION_RATE > 0)
    {
        // mutate a gene
		var geneToMutate = Math.floor(Math.random()*this.GENE_LENGTH);
		var amountToMutate = Math.ceil(Math.random()*this.MUTATION_RATE);
		// put the gene in (-7,7) so we can use modulo
        var newGene = genomeString.charCodeAt(geneToMutate)-71 + amountToMutate;
        // put it back in the correct range
        // if its the last gene, (3,7)
        if (geneToMutate == this.GENE_LENGTH - 1)
        {
            newGene %= this.MAX_GENE_ALLOWED;
            if (newGene < 3)
            {
                newGene = 3;
            }
        }
        // else (-7,7)
        else
        {
            newGene %= this.MAX_GENE_ALLOWED;
        }
        // now put it back into Unicode and return
        var newGenomeString;
        newGenomeString = genomeString.slice(0,geneToMutate).concat(
                                String.fromCharCode(newGene+71)).concat(
								   genomeString.slice(geneToMutate+1));
        return newGenomeString;
	}
	else
	{
	    return genomeString;
	}
};