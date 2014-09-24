function callBackForPerformNormalityTest(p)
{
    if(p < 0.05)
    {   
        //not normal
        if(variableList["independent"].length == 0)
        {
            //one sample t-test
            d3.select("#normality.assumptionNodes").attr("fill", "red");
            
            if(!global.flags.isTestWithoutTimeout )
            {                
                d3.select("#plotCanvas").transition().duration(1000).attr("viewBox", "0 0 " + plotPanelWidth + " " + scaledPlotPanelHeight);
                drawAdvancedPlotButton();
            }

            //draw boxplots in red 
            drawBoxPlotInRed(variableList["dependent"][0]);
            drawNormalityPlot(variableList["dependent"][0], "dataset", "notnormal");

            findTransformForNormalityForDependentVariables(getNumericVariables());
        }
        else
        {
            setDistribution(dependentVariable, level, false);
        }
    }
    else
    {   
        //normal
        if(variableList["independent"].length == 0)
        {
            d3.select("#normality.assumptionNodes").attr("fill", "green");
            
    
            drawDialogBoxToGetPopulationMean();
        }
        else
        {
            setDistribution(dependentVariable, level, true);
        }
    }
}

function callBackForPerformHomoscedasticityTest(output)
{
    var p = output.p;
    var variableList = selectedVisualisation == "DoSignificanceTest" ? sort(selectedVariables) : getSelectedVariables();
    var DV = variableList["dependent"][0];

    // - - - - - - - - - - - - - Set state and draw plot if assumption is violated - - - - - - - - - - - - - 
    if(p < 0.05)
    {           
        // Heteroscedastic               
        d3.select("#homogeneity.assumptionNodes").attr("fill", "red");                 
        console.log("Homogeneity: false");

        if(selectedVisualisation != "DoSignificanceTest")
        {
            d3.select('#plotCanvas').transition().attr("viewBox", "0 0 " + plotPanelWidth + " " + scaledPlotPanelHeight);                
            drawHomogeneityPlot(false);
        }

        findTransformForHomogeneity();
    }
    else
    {   
        // Homoscedastic               
        console.log("Homogeneity: true");
        d3.select("#homogeneity.assumptionNodes").attr("fill", "green");  

        testSelectionLogicAfterHomogeneityTest();      
    }
}