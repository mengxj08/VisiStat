/////////////////////////
//Post-hoc Comparisons //
/////////////////////////

function drawPairwisePostHocComparisonsButtonWithHelpText()
{       
    var variableList = getSelectedVariables();
    var disabledButton = false;    
    var whyNotText = "";

    if(variableList["independent"].length == 1)
    {   
        // is the main effect not significant?
        if(parseFloat(multiVariateTestResults["rawP"]) >= 0.05)
        {            
            disabledButton = true;        
            whyNotText = "Post-hoc tests are disabled because the main effect is not significant";
        }
    }   
    else
    {
        // is there an significant interaction effect?
        if(parseFloat(multiVariateTestResults["rawP"][multiVariateTestResults["rawP"].length-1]) < 0.05)
        {
            disabledButton = true;
            whyNotText = "Post-hoc tests are disabled because there is a significant interaction effect between <IV1> and <IV2>. \nSee post-hoc tests in the interaction effect instead.";
        }
    }

    // draw button
    buttonTopOffset = 45;
    var cx = buttonsPanelWidth/2;

    drawButton("Do pairwise post-hoc comparisons", "postHocComparison", cx, buttonTopOffset, "buttonCanvas", disabledButton);

    if(disabledButton)
        addWhyNotText(cx, whyNotText);
    else
        addExplanationTextForPostHocTest(cx, buttonTopOffset);
}

function addExplanationTextForPostHocTest(cx)
{
    // add help text 
    var canvas = d3.select("#buttonCanvas");    

    // var helpText = canvas.append("text")
    //                                         .attr("x", cx)
    //                                         .attr("y", 2*buttonTopOffset + buttonHeight)
    //                                         .attr("font-size", fontSizes["post-hoc button help text"])
    //                                         .attr("text-anchor", "middle")
    //                                         .text("Use this if you want to compare individual levels...")                    
    //                                         .attr("id", "refText");

    // // 'more' button
    // helpText.append("tspan")
    //                 .attr("font-weight", "bold")
    //                 .attr("fill", "blue")
    //                 .attr("text-decoration", "underline")
    //                 .text("(more)")
    //                 .attr("id", "moreText");
}

function addWhyNotText(cx, text)
{
    var canvas = d3.select("#buttonCanvas");

    // get the bottom edge of bounding box for added text

    var helpText = canvas.append("text")
                                            .attr("x", cx)
                                            .attr("y", 2*buttonTopOffset + buttonHeight)
                                            .attr("font-size", fontSizes["post-hoc button help text"])
                                            .attr("text-anchor", "middle")
                                            .text(text)
                                            .attr("id", "whyNotText");
}

/**
 * Draws the matrix with which the user can interact to view results of pairwise comparisons
 * @return {none} 
 */
function renderPostHocComparisonTable()
{
    updateDecisionTreeNodes(); // Add an entry to the decision tree nodes

    removeElementsByClassName("postHocComparisonTableClickableCells");
    removeElementsByClassName("postHocComparisonTableCells");
    removeElementsByClassName("inactivePostHocComparisonCells");
    removeElementsByClassName("postHocComparisonTable");


    // - - - - - - - - - - - - - Matrix - - - - - - - - - - - - - 

    var variableList = getSelectedVariables();
    var levels = variableList["independent-levels"];
    var nLevels = levels.length;

    var bottomMargin = config.postHoc.helpTextHeight;

    var tableSize = plotHeight - bottomMargin;
    var cellSize = tableSize/nLevels;

    var LEFT = plotPanelWidth + (plotPanelWidth/2 - plotWidth/2); 
    var TOP = plotPanelHeight/2 - plotHeight/2;

    var canvas = d3.select("#plotCanvas");
    
    var levelA, levelB; 

    // Display title

    var title = canvas.append("text")
                                    .attr("x", LEFT + plotHeight/2)
                                    .attr("y", TOP - cellSize*1.5)
                                    .attr("font-size", fontSizes["post-hoc table title"])
                                    .attr("text-anchor", "middle")
                                    .text("Post-hoc comparisons for ")
                                    .attr("class", "postHocComparisonTable");

    title.append("tspan")   
            .attr("class", "variableName")
            .attr("fill", "blue")
            .text(variableList["independent"][0]);

    for(var i=0; i<nLevels; i++)
    {
        // For each level

        canvas.append("text")
                    .attr("x", LEFT + i*cellSize + cellSize/2)
                    .attr("y", TOP - cellSize/4)
                    .attr("font-size", fontSizes["label"])
                    .attr("text-anchor", "start")
                    .attr("transform", "rotate (-90 " + (LEFT + i*cellSize + cellSize/2) + " " + (TOP - cellSize/4) + ")")
                    .text(levels[i])
                    .attr("class", "postHocComparisonTable");

        canvas.append("text")
                    .attr("x", LEFT - cellSize/4)
                    .attr("y", TOP + i*cellSize + cellSize/2)
                    .attr("font-size", fontSizes["label"])
                    .attr("text-anchor", "end")                    
                    .text(levels[i])
                    .attr("class", "postHocComparisonTable");

        for(var j=0; j<nLevels; j++)
        {
            var fillColor = (i == j) ? "black" : "none";

            if(levels[i].localeCompare(levels[j]) < 0)
            {
                levelA = levels[i];
                levelB = levels[j];
            }
            else
            {
                levelB = levels[i];
                levelA = levels[j];
            }

            var className = levelA === levelB ? "inactivePostHocComparisonCells" : "postHocComparisonTableCells";

            canvas.append("rect")
                        .attr("x", LEFT + j*cellSize)
                        .attr("y", TOP + i*cellSize)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", fillColor)
                        .attr("stroke", "black")
                        .attr("id", getValidId(levelA + "-" + levelB))
                        .attr("class", className);
        }
    }

    for(var i=0; i<postHocTestResults["pairs"].length; i++)
    {
        levelA = postHocTestResults["pairs"][i][0];
        levelB = postHocTestResults["pairs"][i][1];

        // sort in alphabetical order
        if(levelA.localeCompare(levelB) > 0)
        {
            var temp = levelB;
            levelB = levelA;
            levelA = temp;
        }

        var x = levels.indexOf(levelA);
        var y = levels.indexOf(levelB);

        var cellText = "=";

        if(postHocTestResults["rawP"][i] < 0.05)
            cellText = String.fromCharCode(8800);
        
        canvas.append("text")
                    .attr("x", LEFT + x*cellSize + cellSize/2)
                    .attr("y", TOP + y*cellSize + cellSize/2 + parseFloat(fontSizes["post-hoc comparison table cell content"])/2)
                    .attr("font-size", fontSizes["post-hoc comparison table cell content"])
                    .attr("text-anchor", "middle")
                    .text(cellText)
                    .attr("class", "postHocComparisonTable");

        canvas.append("text")
                    .attr("x", LEFT + y*cellSize + cellSize/2)
                    .attr("y", TOP + x*cellSize + cellSize/2 + parseFloat(fontSizes["post-hoc comparison table cell content"])/2)
                    .attr("font-size", fontSizes["post-hoc comparison table cell content"])
                    .attr("text-anchor", "middle")
                    .text(cellText)
                    .attr("class", "postHocComparisonTable");

        canvas.append("rect")
                    .attr("x", LEFT + x*cellSize)
                    .attr("y", TOP + y*cellSize)
                    .attr("width", cellSize)
                    .attr("height", cellSize)
                    .attr("fill", "white")
                    .attr("opacity", "0.05")
                    .attr("id", getValidId(levelA + "-" + levelB))
                    .attr("class", "postHocComparisonTableClickableCells");

        canvas.append("rect")
                    .attr("x", LEFT + y*cellSize)
                    .attr("y", TOP + x*cellSize)
                    .attr("width", cellSize)
                    .attr("height", cellSize)
                    .attr("fill", "white")
                    .attr("opacity", "0.05")
                    .attr("id", getValidId(levelA + "-" + levelB))
                    .attr("class", "postHocComparisonTableClickableCells");
    }

    // Help text and legend
    
    canvas.append("text")
                    .attr("x", LEFT + tableSize/2)
                    .attr("y", TOP + tableSize + bottomMargin/2)
                    .attr("text-anchor", "middle")
                    .attr("font-size", fontSizes["display text"])
                    .text("Click on each cell to view details");

    var legendText = ["= : distributions are not significantly diffferent", String.fromCharCode(8800) + ": distributions are significantly different"];
    
    for(var i=0; i<2; i++)
    {
        var padding = 25;
        canvas.append("text")
                    .attr("x", LEFT + tableSize/2)
                    .attr("y", TOP + tableSize + bottomMargin + padding + i*(parseFloat(fontSizes["display text"])*1.5 + padding))
                    .attr("text-anchor", "middle")
                    .attr("font-size", fontSizes["display text"])
                    .text(legendText[i])
    }
}

function updateDecisionTreeNodes()
{
    d3.select("#postHocTestName.assumptionNodes").text(postHocTestResults["method"]);

    var fillColor = usedPostHocTestType == "proper" ? "green" : (usedPostHocTestType == "warning") ? "yellow" : "red";
    d3.select("#postHocTest.assumptionNodes").attr("fill", fillColor);

    var displayText = usedPostHocTestType == "error" ? "The appropriate test is unavailable in VisiStat. The chosen test should not be reported!" : (usedPostHocTestType == "warning") ? "This test does not have the best power for the given data. The appropriate test can be selected from the decision tree (click on the settings button on the top right corner" : "The appropriate test has been chosen based on the assumptions";
    addToolTip("postHocTest" ,"assumptionNodes", displayText);
}

function displayPostHocResults(levelA, levelB, index)
{ 
    var canvas = d3.select("#postHocResultsCanvas");

    canvas.append("text")
            .attr("x", resultsPanelWidth/2)
            .attr("y", 1.5*significanceTestResultStep)
            .attr("text-anchor", "middle")
            .attr("font-size", fontSizes["test result"] )
            .attr("fill", "#627bf4")
            .text("Statistical test: " + postHocTestResults["method"])
            .attr("class", "significanceTest");
    
    if(postHocTestResults["method"] == "Tukey HSD test")
    {
        var X = resultsPanelWidth/4;
        var Y = 3*significanceTestResultStep;

        canvas.append("text")
                        .attr("x", X)
                        .attr("y", Y)
                        .attr("text-anchor", "middle")
                        .attr("font-size", fontSizes["test result"] )
                        .attr("fill", "#627bf4")
                        .attr("class", "parameter")
                        .text("Diff. = " + dec2(postHocTestResults["differences"][index]) + " [" + dec2(postHocTestResults["lowerCI"][index]) + "," + dec2(postHocTestResults["upperCI"][index]) +"]");
    }
    else        
    {                  
        drawParameter(postHocTestResults.hasOwnProperty("df") ? postHocTestResults["df"][index] : 0, parseFloat(postHocTestResults["parameter"][index]), postHocTestResults["parameter-type"], canvas);        
    }
    
    canvas.append("text")
            .attr("x", 3*resultsPanelWidth/4)
            .attr("y", 3*significanceTestResultStep)
            .attr("text-anchor", "middle")
            .attr("font-size", fontSizes["test result"] )
            .attr("fill", "#627bf4")
            .text(postHocTestResults["p"][index])
            .attr("class", "significanceTest");    
    
    // Effect sizes
    
    drawEffectSize(parseFloat(postHocTestResults["effect-size"][index]), postHocTestResults["effect-size-type"], canvas);

    var partialReportText = postHocTestResults["rawP"][index] < 0.05 ? " shows that there is a significant effect" : " shows that there is no significant effect"; 
    
    canvas.append("text")
                            .attr("x", resultsPanelWidth/2)
                            .attr("y", resultsPanelHeight - significanceTestResultStep)
                            .attr("text-anchor", "middle")
                            .attr("font-size", fontSizes["result one-liner"])
                            .text(postHocTestResults["method"] + partialReportText)
                            .attr("class", "significanceTest");
}