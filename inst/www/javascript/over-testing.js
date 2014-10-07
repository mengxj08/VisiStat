/**
 * Checks if there is cyclic testing for over-testing. The number of distributions involved should be > 2.
 * @return {Boolean} true if over-testing
 */
function checkIfOverTesting()
{
	// Test if the number of partial tests done for a particular combination of DV and IV is 2. If so, report possible over-testing.
	
	var index = numberOfEntriesInHistory-1; // Index for retrieving variables
	var variableList = listOfLevelsCompared[index];

	if(variableList["independent"].length != 1) // ToDo: change later
		return;

	var DV = variableList["dependent"][0];
	var IV = variableList["independent"][0];

	if(global.numberOfPartialTestsDone[DV][IV] == 2)	
		displayOverTestingPopup(DV, IV);
}

/**
 * Displays the popup (warning and corrective procedure) for over-testing
 * @param  {string} DV [Dependent variable]
 * @param  {string} IV [Independent variable]
 * @return {none}    
 */
function displayOverTestingPopup(DV, IV)
{
	addDimmer();

	// Display warning to the user that over-testing is detected
	var div = d3.select("body").append("div").attr("id", "overTestingPopup"); // Attach a div to body, where we will append our popup content

	// Get the level pairs of the IV that were compared (which lead to potential over-testing)
	var testedPairs = [];	
	var levels = variables[IV]["dataset"].unique();

	for(var i=0; i<listOfLevelsCompared.length; i++)
	{
		if(listOfLevelsCompared[i]["independent"] == IV)
		{
			testedPairs.push("<li>" + listOfLevelsCompared[i]["independent-levels"][0] + " vs. " + listOfLevelsCompared[i]["independent-levels"][1] + "</li>");
		}
	}

	var htmlText = "";

	htmlText += "<div class='overTestingHead'>Are these tests for single research questions?</div>" + 
				"<div class='overTestingBody'>" +
				"You have compared the following pairs of " + fV(IV) + ":" +
				"<ul class='overTestingBody'>" +
				testedPairs.join() +
				"</ul>" +
				"Using multiple tests in one research question increases the probability of having a significant effect when there is really none (Type I error)." +
				"To avoid this error, we suggest using omni-bus test (e.g., ANOVA) followed by a post-hoc test instead. <br/>" +
				"</div>" +
	 			"<label class='overTesting'><input type='radio' name='test' onClick='doOmnibusTest()'/> The tests above are considered as <b>single</b> research question. " +
	 			"<span class='overTestingExplanation'>Perform omni-bus test: " + fV(DV) + " ~ " + fV(IV) + "(" + levels + "). </span></label>" +
	 			"<label class='overTesting'><input type='radio' name='test' onClick='continuePairwiseTesting()'/>The tests above are considered as <b>multiple</b> research questions." +
	 			"<span class='overTestingExplanation'>Continue with the tests you've selected.</span> </label>";

	div.html(htmlText)
	// Point the user to the appropriate omni-bus test	
}

function continuePairwiseTesting()
{
	removeDimmer();
	removeElementById("overTestingPopup");
	initialiseNumberOfPartialTestsDone();
}

function doOmnibusTest()
{	
	removeDimmer();
	removeElementById("overTestingPopup");
	
	resetSVGCanvas();                                           
	selectedVariables = listOfVariableSelections[numberOfEntriesInHistory-1].clone(); // Get the list of variables that were selected                    
	selectedVisualisation = "Boxplot";

	selectDefaultVisualisation(); // selects the appropriate visualization based on the variables selected (role, number of)
	plotVisualisation(); //checks which plot is selected and draws that plot
	setVisibilityOfVisualisations(); //manages the fill colors of vizualizations (only one at a time) [ToDo]

	removeElementsByClassName("compareMean");

	d3.selectAll(".IQRs, .medians, .TOPFringes, .BOTTOMFringes, .TOPFringeConnectors, .BOTTOMFringeConnectors, .outliers, .CIs, .CITopFringes, .CIBottomFringes").style("opacity", "0.35"); // Make some elements of the boxplot transparent
	selectAllMeans();

	compareMeans(); // Perform the significance test  
	initialiseNumberOfPartialTestsDone(); 
}

function autoResizeDimmer() 
{ 
	$(".overTestingDimmer").css("height", $(window).height()).css("width", $(window).width());
}

function addDimmer()
{
	$("body").append("<div class='overTestingDimmer'></div>");
	autoResizeDimmer()
	$(".overTestingDimmer").fadeIn();
	$(window).bind("resize", autoResizeDimmer);

}
function removeDimmer()
{
	$(".overTestingDimmer").fadeOut('400', function() {
		$(window).unbind("resize", autoResizeDimmer);
		$(".overTestingDimmer").remove();
	});
}
/**
 * Initialises an object that keeps count of number of partial tests done (partial => a subset of levels are compared)
 * @return {none} 
 */
function initialiseNumberOfPartialTestsDone()
{
	// Get all the IVs and DVs
	var DVs = [];
	var IVs = [];

	for(var i=0; i<variableNames.length; i++)
	{
		if(variableRoles[variableNames[i]] == "IV")
			IVs.push(variableNames[i]);
		else if(variableRoles[variableNames[i]] == "DV")
			DVs.push(variableNames[i]);
	}

	// Initialise	
	for(var i=0; i<DVs.length; i++)
	{
		global.numberOfPartialTestsDone[DVs[i]] = {};
		for(var j=0; j<IVs.length; j++)
		{
			global.numberOfPartialTestsDone[DVs[i]][IVs[j]] = 0;
		}
	}	
}

/**
 * Updates global.numberOfPartialTestsDone object 
 * @param  {integer} index [index of the RQ last added]
 * @return {none}    
 */
function updateNumberOfPartialTestsDone(index)
{
	// Get DV and IV	
	var variableList = listOfLevelsCompared[index];

	if(variableList["independent"].length != 1)
		return;

	var DV = variableList["dependent"][0];
	var IV = variableList["independent"][0];	

	// Check if it is a partial test. If so, update object
	var comparedLevels = variableList["independent-levels"];
	var allLevels = variables[IV]["dataset"].unique();

	if(comparedLevels.length < allLevels.length)
	{
		// Partial test
		global.numberOfPartialTestsDone[DV][IV]++;
	}
	else
	{
		// Clear array
		global.numberOfPartialTestsDone[DV][IV] = 0;
	}
}
