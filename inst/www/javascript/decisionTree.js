
// Plots the decision tree given a object of arrays (each array representing a level)
function plotDecisionTree(canvas, decisionTree)
{
	var numberOfLevels = levelNamesOfDecisionTree.length;
	var decisionTreeHeight = height - 7.5*nodeSize;
	var marginLeft = 50;
	var decisionTreeWidth = plotPanelWidth - marginLeft;

	var variableList = getSelectedVariables();

	var unavailableTestParentIds = variableList["independent"].length > 1 ? unavailableTestParentIdsFor2OrMoreIVs : (document.getElementById("postHocTestName") != null ? unavailableTestParentIdsForPostHocTests : unavailableTestParentIdsFor1IV);
	var unavailableTestsPathLabels = variableList["independent"].length > 1 ? unavailableTestsPathLabelsFor2OrMoreIVs : (document.getElementById("postHocTestName") != null ? unavailableTestsPathLabelsForPostHocTests : unavailableTestsPathLabelsFor1IV);

	var centerX, centerY;

	// NODES

	//For each level
	for(var level=0; level<numberOfLevels; level++)
	{
		centerY = getBiteSizeN(level, decisionTreeHeight, numberOfLevels);
		
		//For each node
		for(var node=0; node<decisionTree[levelNamesOfDecisionTree[level]]["values"].length; node++)
		{		
			if(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] != null)
			{
				centerX = getBiteSizePowersOfTwo(node, decisionTreeWidth, decisionTree[levelNamesOfDecisionTree[level]]["values"].length) + (plotPanelWidth - decisionTreeWidth);					
				canvas.rect(centerX - nodeSize/2, centerY - nodeSize/2, nodeSize, nodeSize).attr({transform: "r45", id: toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node), class: "temporary", display: "none"});				
			}
			if(decisionTree[levelNamesOfDecisionTree[level]]["parentNodeIDs"][node] != null)
			{
				//get current  node
				var currentNode = d3.select("#" + toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node));							

				//get parent node
				var parentNode = d3.select("#" + toValidId(decisionTree[levelNamesOfDecisionTree[level]]["parentNodeIDs"][node]));							
				
				var x1 = parseFloat(currentNode.attr("x")) + parseFloat(currentNode.attr("width"))/2;
				var y1 = parseFloat(currentNode.attr("y")) + parseFloat(currentNode.attr("height"));

				var x2 = parseFloat(parentNode.attr("x")) + parseFloat(parentNode.attr("width"))/2;
				var y2 = parseFloat(parentNode.attr("y")) + parseFloat(parentNode.attr("width"))/2;

				var pathAppendText = node%2 == 0 ? "Yes" : "No";
				canvas.path("M" + x1 + " " + y1 + " L" + x1 + " " + y2 + " L" + x2 + " " + y2).attr({fill: "none", stroke: "black", class: "path", id: parentNode.attr("id") + pathAppendText});

				canvas.text(x1, (y1+y2)/2 , decisionTree[levelNamesOfDecisionTree[level]]["pathLabel"][node]).attr({fill: "black", "font-size": fontSizes["decision tree"], "text-anchor": "middle", id: toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node), class: "temporaryText"});

				var text = d3.select("#" + toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node) + ".temporaryText");			
				var bbox = text.node().getBBox();
				var padding = 2;

				canvas.rect(bbox.x - padding, bbox.y - padding, bbox.width + (padding*2), bbox.height + (padding*2)).attr({fill: "white"});
				canvas.text(x1, (y1+y2)/2 , decisionTree[levelNamesOfDecisionTree[level]]["pathLabel"][node]).attr({fill: "black", "font-size": fontSizes["decision tree"], "text-anchor": "middle", id: toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node), class: "pathText"});

				removeElementsByClassName("temporaryText");
			}			
		}
	}	

	canvas.rect(nodeSize, height - 3*nodeSize, decisionTreeWidth, 1.25*nodeSize).attr({stroke: "black", fill: "white", "stroke-dasharray": "5,5", id: "unavailableTests"});
	canvas.text(marginLeft + decisionTreeWidth/2, height - 3*nodeSize + 1.25*nodeSize/2, "The appropriate test for the violation of statistical assumptions is not available in VisiStat. We choose the closest possible test.").attr({"text-anchor": "middle", "font-size": fontSizes["decision tree"]});
	
	for(var i=0; i<unavailableTestParentIds.length; i++)
	{		
		var childLevel = getChildLevel(unavailableTestParentIds[i], decisionTree);
		var childNode = getChildNode(unavailableTestParentIds[i], decisionTree);

		var childNodeRef = d3.select("#" + toValidId(decisionTree[levelNamesOfDecisionTree[childLevel]]["values"][childNode]) + childNode + ".temporary");
		var parentNodeRef = d3.select("#" + unavailableTestParentIds[i] + ".temporary");

		var x2 = parseFloat(parentNodeRef.attr("x")) + parseFloat(parentNodeRef.attr("width"))/2;
		var y2 = parseFloat(parentNodeRef.attr("y")) + parseFloat(parentNodeRef.attr("height"))/2;

		var xRef = parseFloat(childNodeRef.attr("x")) + parseFloat(currentNode.attr("width"))/2;

		var x1 = xRef - x2 < 0 ? x2 + (x2 - xRef) : x2 - (xRef - x2);
		var y1 = height - 3*nodeSize;

		canvas.path("M" + x1 + " " + y1 + " L" + x1 + " " + y2 + " L" + x2 + " " + y2).attr({fill: "none", stroke: "black", class: "path", "stroke-dasharray": "5,5", id: unavailableTestParentIds[i]+ "No"}); //ToDo: this is just a hack for now.

		canvas.text(x1, (y1+y2)/2 , unavailableTestsPathLabels[i]).attr({fill: "black", "font-size": fontSizes["decision tree"], "text-anchor": "middle", id: unavailableTestParentIds[i], class: "temporaryText"});
		var text = d3.select("#" + unavailableTestParentIds[i] + ".temporaryText");			
		var bbox = text.node().getBBox();
		var padding = 2;

		canvas.rect(bbox.x - padding, bbox.y - padding, bbox.width + (padding*2), bbox.height + (padding*2)).attr({fill: "white"});
		canvas.text(x1, (y1+y2)/2 , unavailableTestsPathLabels[i]).attr({fill: "black", "font-size": fontSizes["decision tree"], "text-anchor": "middle", class: "pathText"});

		removeElementsByClassName("temporaryText");
	}

	for(var level=0; level<numberOfLevels; level++)
	{
		centerY = getBiteSizeN(level, decisionTreeHeight, numberOfLevels);
		
		//For each node
		for(var node=0; node<decisionTree[levelNamesOfDecisionTree[level]]["values"].length; node++)
		{
			if(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] != null)
			{
				centerX = getBiteSizePowersOfTwo(node, decisionTreeWidth, decisionTree[levelNamesOfDecisionTree[level]]["values"].length) + (plotPanelWidth - decisionTreeWidth);					
				var nodeOffset = ((node%2 == 1) && (level == (numberOfLevels - 1))) ? 25 : 0;

				if(level == (numberOfLevels - 1))				
					canvas.rect(centerX - nodeSize/2, centerY - nodeSize/2 + nodeOffset, nodeSize, nodeSize).attr({id: toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node]), class: "nodes", fill: "white", stroke: "black"});				
				else
					canvas.rect(centerX - nodeSize/2, centerY - nodeSize/2, nodeSize, nodeSize).attr({transform: "r45", id: toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node), class: "nodes", fill: "white", stroke: "black"});				

				canvas.text(centerX, centerY + nodeSize + nodeTextOffset + nodeOffset , decisionTree[levelNamesOfDecisionTree[level]]["values"][node]).attr({fill: "black", "font-size": fontSizes["decision tree"], "text-anchor": "middle", id: toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node), class: "temporaryText"})

				var text = d3.select("#" + toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node) + ".temporaryText");				
				var bbox = text.node().getBBox();
				var padding = 2;

				canvas.rect(bbox.x - padding, bbox.y - padding, bbox.width + (padding*2), bbox.height + (padding*2)).attr({fill: "white"});
				canvas.text(centerX, centerY + nodeSize + nodeTextOffset + nodeOffset, decisionTree[levelNamesOfDecisionTree[level]]["values"][node]).attr({fill: "black", "font-size": fontSizes["decision tree"], "text-anchor": "middle", id: toValidId(decisionTree[levelNamesOfDecisionTree[level]]["values"][node] + node), class: "nodeText"})

				removeElementsByClassName("temporaryText");
			}
		}
	}
}

function highlightPath(canvas)
{
	var normality=false, homogeneity=false; 

	if(d3.select("#normality.assumptionNodes").attr("fill") == "green")
		normality = true;

	if(d3.select("#homogeneity.assumptionNodes").attr("fill") == "green")
		homogeneity = true;

	var variableList = getSelectedVariables();
	
	if((experimentalDesign == "within-groups") && (getWithinGroupVariable(variableList) == variableList["independent"][0]))
	{
		d3.select("#" + toValidId("Within-groups factor?") + "0Yes.path").attr("stroke-width", "4px");	
		d3.select("#" + toValidId("Within-groups factor?") + "0.nodes").attr("fill", "green");

		if(normality && homogeneity)
		{
			d3.select("#Homogeneity0Yes.path").attr("stroke-width", "4px");
			d3.select("#Homogeneity0.nodes").attr("fill", "green");
			d3.select("#Normality0Yes.path").attr("stroke-width", "4px");
			d3.select("#Normality0.nodes").attr("fill", "green");
		}
		else if(normality)
		{
			d3.select("#Homogeneity0No.path").attr("stroke-width", "4px");
			d3.select("#Homogeneity0.nodes").attr("fill", "red");
		}
		else if(homogeneity)
		{
			d3.select("#Homogeneity0Yes.path").attr("stroke-width", "4px");
			d3.select("#Homogeneity0.nodes").attr("fill", "green");
			d3.select("#Normality0No.path").attr("stroke-width", "4px");	
			d3.select("#Normality0.nodes").attr("fill", "red");
		}
		else
		{
			d3.select("#Homogeneity0No.path").attr("stroke-width", "4px");
			d3.select("#Homogeneity0.nodes").attr("fill", "red");			
		}
	}
	else
	{
		d3.select("#" + toValidId("Within-groups factor?") + "0No.path").attr("stroke-width", "4px");
		d3.select("#" + toValidId("Within-groups factor?") + "0.nodes").attr("fill", "red");

		if(normality && homogeneity)
		{
			d3.select("#Homogeneity1Yes.path").attr("stroke-width", "4px");
			d3.select("#Homogeneity1.nodes").attr("fill", "green");
			d3.select("#Normality2Yes.path").attr("stroke-width", "4px");
			d3.select("#Normality2.nodes").attr("fill", "green");
		}
		else if(normality)
		{
			d3.select("#Homogeneity1No.path").attr("stroke-width", "4px");
			d3.select("#Homogeneity1.nodes").attr("fill", "red");
			d3.select("#Normality3Yes.path").attr("stroke-width", "4px");	
			d3.select("#Normality3.nodes").attr("fill", "green");
		}
		else if(homogeneity)
		{
			d3.select("#Homogeneity1Yes.path").attr("stroke-width", "4px");
			d3.select("#Homogeneity1.nodes").attr("fill", "green");
			d3.select("#Normality2No.path").attr("stroke-width", "4px");	
			d3.select("#Normality2.nodes").attr("fill", "red");
		}
		else
		{
			d3.select("#Homogeneity1No.path").attr("stroke-width", "4px");
			d3.select("#Homogeneity1.nodes").attr("fill", "red");
			d3.select("#Normality3No.path").attr("stroke-width", "4px");	
			d3.select("#Normality3.nodes").attr("fill", "red");
		}
	}

	if(document.getElementById("postHocTestName") == null)
	{
		console.log(multiVariateTestResults["method"]);
		d3.select("#" + toValidId(multiVariateTestResults["method"]) + ".nodes").attr("fill", d3.select("#statisticalTest.assumptionNodes").attr("fill"));		
	}
	else
	{
		console.log(postHocTestResults["method"]);
		d3.select("#" + toValidId(postHocTestResults["method"]) + ".nodes").attr("fill", d3.select("#postHocTest.assumptionNodes").attr("fill"));
	}
}
function getBiteSizeN(index, totalSize, numberOfBites)
{

	return (index)*(totalSize/(numberOfBites-1)) + nodeSize;
}

function getBiteSizePowersOfTwo(index, totalSize, numberOfBites)
{
	numberOfBites = Math.round(log2(numberOfBites) + 1);

	return (totalSize/Math.pow(2, numberOfBites) + index*totalSize/Math.pow(2, numberOfBites-1));
}

function log2(val) 
{
  return Math.log(val) / Math.LN2;
}

function log10(val) 
{
  return Math.log(val) / Math.LN10;
}

function toValidId(id)
{
	id = id.replace('?', '');
	id = id.replace(/'/g, "");
	id = id.replace("*", "");
	id = id.replace(/:/g,'');
	id = id.replace(/\s/g, '');
		
	return id;
}

function getChildLevel(value, decisionTree)
{
	for(var level = 0; level < levelNamesOfDecisionTree.length; level++)
	{
		for(var node = 0; node < decisionTree[levelNamesOfDecisionTree[level]]["parentNodeIDs"].length; node++)
		{
			if(decisionTree[levelNamesOfDecisionTree[level]]["parentNodeIDs"][node] != null)
			{
				if(value == toValidId(decisionTree[levelNamesOfDecisionTree[level]]["parentNodeIDs"][node]))
					return level;			
			}
		}
	}

	return -1;
}

function getChildNode(value, decisionTree)
{
	for(var level = 0; level < levelNamesOfDecisionTree.length; level++)
	{
		for(var node = 0; node < decisionTree[levelNamesOfDecisionTree[level]]["parentNodeIDs"].length; node++)
		{
			if(decisionTree[levelNamesOfDecisionTree[level]]["parentNodeIDs"][node] != null)
			{
				if(value == toValidId(decisionTree[levelNamesOfDecisionTree[level]]["parentNodeIDs"][node]))
					return node;
			}
		}
	}

	return -1;
}

function drawFooter()
{
	var canvas = d3.select("#decisionTreeCanvas");
	var marginLeft = 50;

	canvas.append("text")
		.text("* : with Bonferroni correction (p-values are adjusted to minimise family-wise error rate)")
		.attr("x", marginLeft + plotPanelWidth/2)
		.attr("y", height - nodeSize)
		.attr("text-anchor", "middle")
		.attr("font-size", fontSizes["decision tree"]);
}
